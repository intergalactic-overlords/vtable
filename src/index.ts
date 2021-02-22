import VirtualTable from "./VirtualTable";

const items = [];
for (var i = 0; i < 10000; i++) {
  items[items.length] = { a: "a" + i, b: "b" + i, c: "c" + i };
}

const columns = [
  { id: "a", label: "Attr1" },
  { id: "b", label: "Attr3" },
  { id: "c", label: "Attr2" }
];

const vTable = new VirtualTable(
  {
    debug: true,
    rowHeight: 16
  },
  columns,
  items
).mount("#app");
