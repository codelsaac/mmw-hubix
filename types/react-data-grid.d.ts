declare module 'react-data-grid' {
  import { ComponentType } from 'react';

  export interface Column<TRow = any> {
    key: string;
    name: string;
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    resizable?: boolean;
    sortable?: boolean;
    frozen?: boolean;
    headerRenderer?: ComponentType<any>;
    formatter?: ComponentType<any>;
    summaryFormatter?: ComponentType<any>;
    groupFormatter?: ComponentType<any>;
    editable?: boolean | ((row: TRow) => boolean);
    editor?: ComponentType<any>;
    renderEditCell?: ComponentType<any>;
    editorOptions?: {
      renderFormatter?: boolean;
      editOnClick?: boolean;
      commitOnOutsideClick?: boolean;
    };
  }

  export interface DataGridProps<TRow = any> {
    columns: Column<TRow>[];
    rows: TRow[];
    rowKeyGetter?: (row: TRow) => string | number;
    onRowsChange?: (rows: TRow[], data: { indexes: number[]; column: Column<TRow> }) => void;
    sortColumns?: readonly SortColumn[];
    onSortColumnsChange?: (sortColumns: readonly SortColumn[]) => void;
    defaultColumnOptions?: Partial<Column<TRow>>;
    groupBy?: string[];
    rowGrouper?: (rows: TRow[], columnKey: string) => Record<string, TRow[]>;
    expandedGroupIds?: Set<unknown>;
    onExpandedGroupIdsChange?: (expandedGroupIds: Set<unknown>) => void;
    selectedRows?: ReadonlySet<string>;
    onSelectedRowsChange?: (selectedRows: ReadonlySet<string>) => void;
    topSummaryRows?: TRow[];
    bottomSummaryRows?: TRow[];
    rowHeight?: number | ((row: TRow) => number);
    headerRowHeight?: number;
    summaryRowHeight?: number;
    className?: string;
    style?: React.CSSProperties;
    direction?: 'ltr' | 'rtl';
    enableVirtualization?: boolean;
  }

  export interface SortColumn {
    columnKey: string;
    direction: 'ASC' | 'DESC';
  }

  export interface SelectColumn extends Column {
    key: 'select-row';
    name: '';
    width: number;
    minWidth: number;
    maxWidth: number;
    resizable: false;
    sortable: false;
    frozen: true;
  }

  export const SelectColumn: SelectColumn;
  export const textEditor: ComponentType<any>;
  export const DataGrid: ComponentType<DataGridProps>;
  
  const _default: ComponentType<DataGridProps>;
  export default _default;
}
