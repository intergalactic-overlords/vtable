import { TColumn } from "./types";
import VirtualTable from "./VirtualTable";

const items = [];
for (var i = 0; i < 25; i++) {
  items[items.length] = { a: "a" + i, b: "b" + i, c: "c" + i };
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
).mount("#app");
