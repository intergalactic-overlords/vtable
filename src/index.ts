import { TColumn, TColumnSetting, TRow } from "./types";
import VirtualTable from "./VirtualTable";
import debounce from "./debounce";

const getSavedColumns = () => {
  try {
    const columnsData = localStorage.getItem("columns");
    if (columnsData) {
      const columns = JSON.parse(columnsData);
      return columns;
    }
  } catch {}
  return [];
};

const handleChangeColumnWidth = (column: TColumnSetting) => {
  const savedColumns = getSavedColumns();
  console.log("savedColumns: ", savedColumns);
  const savedColumn = savedColumns.find(
    (c: TColumnSetting) => c.id === column.id
  );
  if (savedColumn) {
    savedColumn.width = column.width;
  } else {
    savedColumns.push(column);
  }
  localStorage.setItem("columns", JSON.stringify(savedColumns));
};

const items: TRow[] = [];
for (let i = 0; i < 99; i++) {
  items[items.length] = { a: "a" + i, b: "b" + i, c: "c" + i };
}

const items2: TRow[] = [];
for (let i = 0; i < 20; i++) {
  items2[items2.length] = { a: "x" + i, b: "y" + i, c: "z" + i };
}
const savedColumns = getSavedColumns();

const columns: TColumn[] = [
  { id: "a", label: "Attr1", type: "text", width: 150, resizable: true },
  { id: "b", label: "Attr3", type: "text", resizable: true },
  { id: "c", label: "Attr2", type: "text", resizable: true }
];
savedColumns.forEach((c: TColumnSetting) => {
  const column = columns.find((column) => column.id === c.id);
  if (column) {
    column.width = c.width;
  }
});

const vTable = new VirtualTable(
  {
    debug: true,
    rowHeight: 20,
    onChangeColumnWidth: debounce(handleChangeColumnWidth, 200)
  },
  columns,
  items
);
vTable.mount("#app");

window.newContent = () => {
  vTable.updateRows(items2);
};
