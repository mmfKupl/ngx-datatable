import { TableColumn } from './table-column.type';

export type ColumnResizeEventType = 'resize-start' | 'resizing' | 'resize-end';
export interface ColumnResizeEvent {
  type: ColumnResizeEventType;
  column: TableColumn;
  prevValue: number;
  newValue: number;
  notLimitedNewValue: number;
}
