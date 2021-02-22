import { TColumn, TRow } from "./types";
import VirtualTable from "./VirtualTable";

const items: TRow[] = [];
for (let i = 0; i < 99; i++) {
  items[items.length] = { a: "a" + i, b: "b" + i, c: "c" + i };
}

const items2: TRow[] = [];
for (let i = 0; i < 20; i++) {
  items2[items2.length] = { a: "x" + i, b: "y" + i, c: "z" + i };
}

const columns: TColumn[] = [
  { id: "a", label: "Attr1", type: "text" },
  { id: "b", label: "Attr3", type: "text" },
  { id: "c", label: "Attr2", type: "text" }
];

const vTable = new VirtualTable(
  {
    debug: true,
    rowHeight: 16
  },
  columns,
  items
);
vTable.mount("#app");

window.newContent = () => {
  vTable.updateRows(items2);
};
