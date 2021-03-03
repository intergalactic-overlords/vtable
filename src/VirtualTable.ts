import { TRow, TColumnSetting, TColumn, TConfig } from "./types";

class VirtualTable {
  columns: TColumn[] = [];
  rows: TRow[] = [];

  debug = false;

  rowHeight = 32;
  totalRows = 0;
  visibleRows = 0;
  hiddenRowsTop = 0;
  rowsOffset = 0;

  element?: Element | null;
  container?: HTMLDivElement;
  scroller: HTMLDivElement;

  dataIndexObserver: MutationObserver;
  resizeObserver: ResizeObserver;

  dataIndexConfig = {
    attributes: true,
    childList: false,
    subtree: false
  };
  resizeConfig = {
    childList: false,
    attributes: true,
    subtree: false
  };

  onChangeColumnWidth: (columns: TColumnSetting) => void;

  static DEFAULT_COLUMN_MIN_WIDTH = 40;
  static DEFAULT_COLUMN_WIDTH = 200;

  constructor(config: TConfig, columns: TColumn[], rows: TRow[]) {
    if (config.rowHeight) {
      this.rowHeight = config.rowHeight;
    }
    if (config.debug) {
      this.debug = config.debug;
    }
    this.totalRows = rows.length;
    this.scroller = this.createScroller(this.rowHeight * this.totalRows);
    this.rows = rows;
    this.columns = columns;
    this.dataIndexObserver = new MutationObserver(
      this.rowIndexMutationCallback
    );
    this.resizeObserver = this.createNewResizeObserver();
    this.onChangeColumnWidth = config.onChangeColumnWidth;
  }

  public mount(selector: string) {
    this.element = document.querySelector(selector);
    this.container = this.createContainer();
    if (this.element) {
      this.element.appendChild(this.container);
    }
    this.visibleRows =
      Math.floor(this.container.clientHeight / this.rowHeight) + 1;
    this.container.appendChild(this.createHeader());
    this.container.appendChild(this.scroller);
    this.createVirtualRows().forEach((r) => {
      this.scroller.appendChild(r);
    });

    this.container.addEventListener("scroll", this.handleScroll);
    this.resizeObserver.observe(this.container);
  }

  private createHeader = () => {
    const header = document.createElement("div");
    header.className = "header";
    header.append(
      ...this.columns.map((c) => {
        return this.createHead(c);
      })
    );
    return header;
  };

  private createContainer = () => {
    const container = document.createElement("div");
    container.className = "container";
    return container;
  };

  private createScroller = (h: number) => {
    const scroller = document.createElement("div");
    scroller.className = "scroller";
    scroller.style.height = `${h}px`;
    return scroller;
  };

  private createVirtualRows = () => {
    const rows = [];
    for (let i = 0; i < this.visibleRows; i++) {
      const row = this.createRow(i);
      rows.push(row);
    }
    return rows;
  };

  private createRow = (index: number, visibleRows?: number) => {
    const row = document.createElement("div");
    const offsetHeight = index * this.rowHeight;

    row.className = "row";
    row.dataset.index = `${index}`;
    row.style.height = `${this.rowHeight}px`;
    row.style.transform = `translate(0px, ${offsetHeight}px)`;
    // event handler to display data
    row.replaceChildren(...this.createCells(index));
    if (this.debug) {
      row.style.backgroundColor = this.calculateBG(index);
    }
    if (this.dataIndexObserver) {
      this.dataIndexObserver.observe(row, this.dataIndexConfig);
    }
    return row;
  };

  private calculateBG = (index: number) => {
    const red = index % 6 < 3 ? 0 : 255;
    const green = (index + 2) % 6 < 3 ? 0 : 255;
    const blue = (index + 4) % 6 < 3 ? 0 : 255;
    return `rgba(${red}, ${green}, ${blue}, 0.3)`;
  };

  private handleScroll = (e: any) => {
    e.preventDefault();

    const positionFromTop = e.target && e.target.scrollTop;
    this.hiddenRowsTop = Math.floor(positionFromTop / this.rowHeight);

    this.rowsOffset = this.hiddenRowsTop % this.visibleRows;
    const virtualRows = Array.from(this.scroller.children);
    (virtualRows as HTMLDivElement[]).forEach(this.updateVirtualRowPosition);
  };

  private updateVirtualRowPosition = (row: HTMLDivElement, i: number) => {
    const positionIndex =
      (this.visibleRows - this.rowsOffset + i) % this.visibleRows;
    const hiddenRowsTopHeight = this.hiddenRowsTop * this.rowHeight;
    const offsetHeight = hiddenRowsTopHeight + positionIndex * this.rowHeight;
    row.style.transform = `translate(0px, ${offsetHeight}px)`;

    const index = this.hiddenRowsTop + positionIndex;

    row.dataset.index = `${index}`;
    if (this.debug) {
      row.style.backgroundColor = this.calculateBG(index);
    }
  };

  private rowIndexMutationCallback = (mutationsList: MutationRecord[]) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "attributes") {
        // TODO: mutate instead of replace?
        (mutation.target as Element).replaceChildren(
          ...this.createCells((mutation.target as Element).dataset.index)
        );
      }
    });
  };

  private createNewResizeObserver = () => {
    return new ResizeObserver((entries: ResizeObserverEntry[]) => {
      entries.forEach((entry: ResizeObserverEntry) => {
        const { height } = entry.contentRect;
        this.recalculateVirtualRows(height);
      });
    });
  };

  private recalculateVirtualRows = (height: number) => {
    const newVisibleRows = Math.floor(height / this.rowHeight) + 1;
    if (newVisibleRows !== this.visibleRows) {
      if (newVisibleRows > this.visibleRows) {
        this.addVirtualRows(newVisibleRows);
      } else if (newVisibleRows < this.visibleRows) {
        this.removeVirtualRows(newVisibleRows);
      }
      this.visibleRows = newVisibleRows;
      this.rowsOffset = this.hiddenRowsTop % this.visibleRows;
    }
  };

  private removeVirtualRows = (newVisibleRows: number) => {
    const virtualRows = Array.from(this.scroller.children);
    for (let i = this.visibleRows - 1; i > newVisibleRows - 1; i--) {
      const indexToRemove = this.hiddenRowsTop + i;
      const childToRemove = (virtualRows as HTMLDivElement[]).find(
        (r) =>
          r.dataset.index && parseInt(r.dataset.index, 10) === indexToRemove
      );
      if (childToRemove) {
        this.scroller.removeChild(childToRemove);
      }
    }
  };

  private addVirtualRows = (newVisibleRows: number) => {
    for (let i = this.visibleRows; i < newVisibleRows; i++) {
      const nextIndex = this.hiddenRowsTop + i;
      if (nextIndex !== this.rows.length) {
        const rowToAdd = this.createRow(nextIndex, newVisibleRows);
        this.scroller.appendChild(rowToAdd);
      } else {
        const firstChild = this.scroller.children[0] as HTMLDivElement;
        if (firstChild && firstChild.dataset.index) {
          const firstIndex = parseInt(firstChild.dataset.index, 10);
          if (firstIndex > 0) {
            const rowToAdd = this.createRow(firstIndex - 1, newVisibleRows);
            this.scroller.appendChild(rowToAdd);
          }
        }
      }
    }
  };

  private createCells = (rowIndex: number) =>
    this.columns.map((c) => this.createCell(rowIndex, c));

  public updateRows = (rows: TRow[]) => {
    this.totalRows = rows.length;
    this.scroller.style.height = `${this.rowHeight * this.totalRows}px`;
    this.rows = rows;

    if (this.container) {
      this.container.scrollTop = 0;
    }

    while (this.scroller.firstChild) {
      this.scroller.removeChild(this.scroller.firstChild);
    }

    this.createVirtualRows().forEach((r) => {
      this.scroller.appendChild(r);
    });
  };

  // Head methods
  private createHead = (column: TColumn) => {
    const head = document.createElement("div");
    head.append(column.label);
    head.classList.add("head");
    if (column.resizable) {
      const resizer = document.createElement("div");
      resizer.classList.add("resizer");
      head.append(resizer);
    }
    head.style.minWidth = `${
      column.minWidth || VirtualTable.DEFAULT_COLUMN_MIN_WIDTH
    }px`;
    head.style.width = `${column.width || VirtualTable.DEFAULT_COLUMN_WIDTH}px`;
    head.dataset.celltype = column.type;
    head.dataset.columnid = column.id;
    this.setColumnListeners(head);
    return head;
  };

  // Cell methods
  // TODO: separate class?

  private createCell = (index: number, column: TColumn) => {
    const cell = document.createElement("div");
    cell.classList.add("cell", "cell-text");
    if (this.rows[index]) {
      cell.append(this.rows[index][column.id]);
    } else {
      cell.classList.add("cell-empty");
    }
    cell.style.minWidth = `${
      column.minWidth || VirtualTable.DEFAULT_COLUMN_MIN_WIDTH
    }px`;
    cell.style.width = `${column.width || VirtualTable.DEFAULT_COLUMN_WIDTH}px`;
    cell.dataset.celltype = column.type;
    cell.dataset.columnid = column.id;
    cell.dataset.rowid = `${index}`;
    return cell;
  };

  // private createTextCell = (index: number, column: TColumn) => {
  //   const cell = document.createElement("div");
  //   cell.classList.add("cell", "cell-text");
  //   if (this.rows[index]) {
  //     cell.append(this.rows[index][column.id]);
  //   } else {
  //     cell.classList.add("cell-empty");
  //   }
  //   cell.style.minWidth = `${
  //     column.minWidth || VirtualTable.DEFAULT_COLUMN_MIN_WIDTH
  //   }px`;
  //   cell.style.width = `${column.width || VirtualTable.DEFAULT_COLUMN_WIDTH}px`;
  //   return cell;
  // };

  private setColumnListeners = (div: HTMLDivElement) => {
    let pageX;
    let curCol;
    let columnId: string;
    let curColWidth;
    const onChangeColumnWidth = this.onChangeColumnWidth;
    div.addEventListener("mousedown", function (e) {
      if (e.target) {
        curCol = e.target.parentElement;
        columnId = curCol.dataset.columnid;
        pageX = e.pageX;
        curColWidth = curCol.offsetWidth;
      }
    });

    document.addEventListener("mousemove", function (e) {
      if (curCol) {
        var diffX = e.pageX - pageX;

        const cells = document.querySelectorAll(
          `.head[data-columnid="${columnId}"], .cell[data-columnid="${columnId}"]`
        );

        const newWidth = curColWidth + diffX;
        onChangeColumnWidth({
          id: columnId,
          width: newWidth
        });
        cells.forEach((c) => {
          c.style.width = `${newWidth}px`;
        });
      }
    });

    document.addEventListener("mouseup", function (e) {
      curCol = undefined;
      columnId = undefined;
      pageX = undefined;
      curColWidth = undefined;
    });
  };

  private editCell = () => {};

  private deleteCell = () => {};

  private cancelEditCell = () => {};

  private saveEditCell = () => {};

  private setCellWidth = () => {};

  private hideCell = () => {};

  private showCell = () => {};
}

export default VirtualTable;
