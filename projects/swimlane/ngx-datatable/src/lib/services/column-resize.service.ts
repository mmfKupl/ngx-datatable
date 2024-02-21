import { Injectable } from '@angular/core';

export interface ColumnWidths {
  width: string;
  minWidth: string;
  maxWidth: string;
}

@Injectable()
export class ColumnResizeService {
  afterMouseDown(event: MouseEvent, element: HTMLElement, initialWidths: ColumnWidths): void {
    return;
  }
  afterMouseUp(event: MouseEvent, element: HTMLElement, initialWidths: ColumnWidths): void {
    return;
  }
  afterMouseMove(event: MouseEvent, element: HTMLElement, newWidths: ColumnWidths): void {
    return;
  }
}
