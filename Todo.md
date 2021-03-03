# TODO

- scroller background that simulates 'loading rows'
- change column sizes
  - no flexbox...
  - set default minWidth on columns
  - minWidth as an option on columns...
  - 'state' of columns needs to be kept somewhere...
  - perhaps 'state' of columns can be an external object with onchange... ? Or is that too slow?
- sticky first column
  - no flexbox...
- row editable
  - start scroll, stop edit
  - fires onchange...
- row deletable
  - fires onchange...
- hide column
- table class returns its own instance thing?
- clean up watchers and event handlers?
- selected row?
- focus on table for keyboard actions?
- keyboard for action
  - delete
  - edit
  - up
  - down
  - pageup
  - pagedown
- sort on column
  - each type has its own sort
- date column
- number column
- Row as separate class?
- Cell as separate class?

  - baseclass for cell
  -

  class for textCell, dateCell, ...

- split class over multiple files?

## docs?

https://css-tricks.com/snippets/css/complete-guide-grid/
https://stackoverflow.com/questions/40104004/split-a-javascript-class-es6-over-multiple-files

## structure:

.container
.scroller
.header
.head.head-text.head-resizable.head-sticky.head-sortable.head-sort.head-sort-asc.head-sort-desc
.row.row-selected
.cell.cell-text.cell-resizable.cell-editable.cell-editing.cell-sticky
.row

## cell functions/methods:

- create()
- updateRow()
- edit()
- delete() -> cleanup
- cancelEdit()
- onEdit()
- setWidth()
- hide()
- show()

- dataset.celltype
- dataset.rowid
- dataset.columnid
