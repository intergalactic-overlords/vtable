import { TCellType, TColumn } from "./types";

class Cell {
  editable: boolean = false;
  editing: boolean = false;
  sticky: boolean = false;
  type: TCellType;

  element: HTMLDivElement;

  model: any;
  rowId: string | number;
  columnId: string;
  formattedContent: string | HTMLElement = "";

  constructor(column: TColumn, rowId: string | number, model: any) {
    // super();
    this.type = column.type;
    this.model = model;
    this.rowId = rowId;
    this.columnId = column.id;
    this.editable = !!column.editable;
    this.formattedContent = this.formatContent();
    this.element = document.createAttribute("div");
    // return this.element;
  }

  connectedCallback() {
    this.append(this.formattedContent);
    // this.innerHTML = this.formattedContent;
    this.classList.add("cell", `cell-${this.type}`);

    if (this.editable) {
      this.classList.add("cell-editable");
    }
    if (this.sticky) {
      this.classList.add("cell-sticky");
    }
  }

  public updateRow = (rowId: string | number, model: any) => {
    this.rowId = rowId;
    this.model = model;
    this.formattedContent = this.formatContent();

    this.append(this.formattedContent);
  };

  public edit = () => {
    if (this.editable) {
      this.editing = true;
    }
  };

  private cancelEdit = () => {
    if (this.editable) {
      this.editing = false;
    }
  };

  private formatContent = () => {
    switch (this.type) {
      case "text":
        return this.model;
      case "integer":
        return this.model;
      case "date":
        return this.model;
      default:
        return this.model;
    }
  };
}

export default Cell;
