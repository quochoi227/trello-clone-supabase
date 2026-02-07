import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Board } from "./kanban-board";
import { KanbanColumn } from "./kanban-column";

export function ListColumns({ columns }: { columns: Board["columns"] }) {

  const columnIds = columns?.map((column) => column._id)

  return (
    <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
      <div className="w-full h-full flex gap-4 overflow-x-auto pb-4 scrollbar-custom">
        {columns.map((column) => (
          <KanbanColumn key={column._id} column={column} />
        ))}
      </div>
    </SortableContext>
  )
}