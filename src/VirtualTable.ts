import { TRow, TColumn, TConfig } from "./types";

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
  }

  public mount(selector: string) {
    this.element = document.querySelector(selector);
    this.container = this.createContainer();
    if (this.element) {
      this.element.appendChild(this.container);
    }
    this.visibleRows =
      Math.floor(this.container.clientHeight / this.rowHeight) + 1;
    this.container.appendChild(this.scroller);
    this.createVirtualRows().forEach((r) => {
      this.scroller.appendChild(r);
    });

    this.container.addEventListener("scroll", this.handleScroll);

    if (this.resizeObserver) {
      this.resizeObserver.observe(this.container);
    }
  }

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
        if (this.scrolledToBottom()) {
          this.addVirtualRowsToTop(newVisibleRows);
        } else {
          this.addVirtualRowsToEnd(newVisibleRows);
        }
        // this.addVirtualRowsToTop(newVisibleRows);
        // if scrolled to bottom?
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

  private addVirtualRowsToEnd = (newVisibleRows: number) => {
    for (let i = this.visibleRows; i < newVisibleRows; i++) {
      const nextIndex = this.hiddenRowsTop + i;
      const rowToAdd = this.createRow(nextIndex, newVisibleRows);

      this.scroller.appendChild(rowToAdd);
    }
  };

  private addVirtualRowsToTop = (newVisibleRows: number) => {
    const rowsToAdd = newVisibleRows - this.visibleRows;
    for (let i = 1; i < rowsToAdd + 1; i++) {
      const nextIndex = this.hiddenRowsTop - i;
      const rowToAdd = this.createRow(nextIndex, newVisibleRows);

      this.scroller.appendChild(rowToAdd);
    }
  };

  private scrolledToBottom = () => {
    return (
      this.container &&
      this.container.scrollHeight -
        this.container.scrollTop -
        this.container.clientHeight <
        1
    );
  };

  private createCells = (index: number) => {
    return this.columns.map((c) => {
      switch (c.type) {
        case "text":
          return this.createTextCell(index, c.id);
        default:
          return "";
      }
    });
  };

  private createTextCell = (index: number, columnId: string) => {
    const cell = document.createElement("div");
    cell.classList.add("cell", "cell-text");
    if (this.rows[index]) {
      cell.innerHTML = this.rows[index][columnId];
    } else {
      cell.classList.add("cell-empty");
    }
    return cell;
  };
}

export default VirtualTable;
