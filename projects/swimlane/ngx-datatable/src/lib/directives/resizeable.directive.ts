import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  Renderer2
} from '@angular/core';
import { Subscription, fromEvent, BehaviorSubject, Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColumnResizeService, ColumnWidths } from '../services/column-resize.service';
import { ColumnResizeEventType } from '../types/events.type';

@Directive({
  selector: '[resizeable]',
  host: {
    '[class.resizeable]': 'resizeEnabled'
  }
})
export class ResizeableDirective implements OnDestroy, AfterViewInit {
  protected resizeEnabled$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  @Input() set resizeEnabled(resizeEnabled: boolean) {
    this.resizeEnabled$.next(resizeEnabled);
  }
  get resizeEnabled(): boolean {
    return this.resizeEnabled$.value;
  }

  @Input() minWidth: number;
  @Input() maxWidth: number;

  @Output() resizeChange: EventEmitter<[ColumnResizeEventType, number]> = new EventEmitter();

  element: HTMLElement;
  subscription: Subscription;
  resizing: boolean = false;
  private resizeHandle: HTMLElement;
  private initialWidths: ColumnWidths = {
    width: '',
    minWidth: '',
    maxWidth: ''
  };

  protected destroy$: Subject<void> = new Subject<void>();

  constructor(element: ElementRef, private renderer: Renderer2, private columnResizeService: ColumnResizeService) {
    this.element = element.nativeElement;
  }

  ngAfterViewInit(): void {
    this.resizeEnabled$.pipe(takeUntil(this.destroy$)).subscribe((enabled: boolean) => {
      this.toggleResizeHandle(enabled);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this._destroySubscription();
    if (this.renderer.destroyNode) {
      this.renderer.destroyNode(this.resizeHandle);
    } else if (this.resizeHandle) {
      this.renderer.removeChild(this.renderer.parentNode(this.resizeHandle), this.resizeHandle);
    }
  }

  @HostListener('mousedown', ['$event'])
  onResizeStart(event: MouseEvent): void {
    const isHandle: boolean = (<HTMLElement>event.target).classList.contains('resize-handle');
    if (!isHandle) {
      return;
    }
    event.stopPropagation();

    const initialWidth: number = this.element.clientWidth;
    const mouseDownScreenX: number = event.screenX;

    this.resizing = true;
    this.initialWidths = {
      ...this.initialWidths,
      width: this.element.style.width,
      maxWidth: this.element.style.maxWidth,
      minWidth: this.element.style.minWidth
    };

    const mouseup$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, 'mouseup');
    this.subscription = mouseup$.subscribe((e: MouseEvent) => this.onResizeEnd(e));

    const mouseMoveSub: Subscription = fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(takeUntil(mouseup$))
      .subscribe((e: MouseEvent) => this.onResizing(e, initialWidth, mouseDownScreenX));

    this.subscription.add(mouseMoveSub);

    this.columnResizeService.afterMouseDown(event, this.element, this.initialWidths);
    this.emitResizeChangeEvent('resize-start', false);
  }

  private onResizing(event: MouseEvent, initialWidth: number, mouseDownScreenX: number): void {
    const nextWidth: number = this.move(event, initialWidth, mouseDownScreenX);
    const newWidths: ColumnWidths = {
      ...this.initialWidths,
      width: `${nextWidth}px`
    };

    this.emitResizeChangeEvent('resizing', false);
    this.columnResizeService.afterMouseMove(event, this.element, newWidths);
  }

  private onResizeEnd(event: MouseEvent): void {
    this.resizing = false;
    this.emitResizeChangeEvent('resize-end', true);
    this.columnResizeService.afterMouseUp(event, this.element, this.initialWidths);
  }

  private move(event: MouseEvent, initialWidth: number, mouseDownScreenX: number): number {
    const movementX = event.screenX - mouseDownScreenX;
    const newWidth = initialWidth + movementX;

    const overMinWidth = !this.minWidth || newWidth >= this.minWidth;
    const underMaxWidth = !this.maxWidth || newWidth <= this.maxWidth;

    if (overMinWidth && underMaxWidth) {
      this.element.style.width = `${newWidth}px`;
      return newWidth;
    }
    return initialWidth;
  }

  private _destroySubscription() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
    }
  }

  private toggleResizeHandle(enabled: boolean): void {
    const isResizeHandleExist: boolean = this.resizeHandle !== undefined;

    const renderer2 = this.renderer;
    if (!isResizeHandleExist) {
      this.resizeHandle = renderer2.createElement('span');
    }
    if (enabled) {
      renderer2.removeClass(this.resizeHandle, 'resize-handle--not-resizable');
      renderer2.addClass(this.resizeHandle, 'resize-handle');
    } else {
      renderer2.removeClass(this.resizeHandle, 'resize-handle');
      renderer2.addClass(this.resizeHandle, 'resize-handle--not-resizable');
    }
    if (!isResizeHandleExist) {
      renderer2.appendChild(this.element, this.resizeHandle);
    }
  }

  private emitResizeChangeEvent(type: ColumnResizeEventType, destroySub: boolean): void {
    if (this.subscription && !this.subscription.closed) {
      if (destroySub) {
        this._destroySubscription();
      }
      this.resizeChange.emit([type, this.element.clientWidth]);
    }
  }
}
