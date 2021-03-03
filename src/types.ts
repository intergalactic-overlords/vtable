export type TCellType = "text" | "date" | "integer";

export type TColumnSetting = {
  id: string;
  width: number;
};

export type TConfig = {
  debug?: boolean;
  rowHeight?: number;
  onChangeColumnWidth: (columns: TColumnSetting) => void;
};

export type TColumn = {
  label: string;
  id: string;
  type: TCellType;
  editable?: boolean;
  hidden?: boolean;
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
};

export type TRow = any;
