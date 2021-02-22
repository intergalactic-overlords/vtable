export type TConfig = {
  debug?: boolean;
  rowHeight?: number;
};

export type TColumn = {
  label: string;
  id: string;
  type: "text" | "date";
  editable?: boolean;
  hidden?: boolean;
};

export type TRow = any;
