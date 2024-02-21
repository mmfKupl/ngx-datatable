import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Gets the width of the scrollbar.  Nesc for windows
 * http://stackoverflow.com/a/13382873/888165
 */
@Injectable()
export class ScrollbarHelper {
  width: number = this.getWidth();

  constructor(@Inject(DOCUMENT) private document: any) {}

  protected getElementToAppend(): HTMLElement {
    return this.document.body;
  }

  getWidth(): number {
    const outer = this.document.createElement('div');
    outer.classList.add('ngx-datatable-scroller-helper-outer');
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.msOverflowStyle = 'scrollbar';
    this.getElementToAppend().appendChild(outer);

    const widthNoScroll = outer.offsetWidth;
    outer.style.overflow = 'scroll';

    const inner = this.document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    const widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
  }
}
