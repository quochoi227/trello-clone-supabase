"use client"

import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Board, Column } from "./kanban-board";
import { KanbanColumn } from "./kanban-column";
import { Button } from "../ui/button";
import { CirclePlus, X } from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { generatePlaceholderCard } from "@/utils/formatters";
// import { cloneDeep } from "lodash";
import { useBoardStore } from "@/stores/board-store";
import CardDetail from "@/app/boards/[id]/_components/card/card-detail";

export function ListColumns({ columns }: { columns: Board["columns"] }) {
  const { currentActiveBoard, setCurrentActiveBoard, subscribeToBoard, subscribeToColumn, subscribeToCard } = useBoardStore()
  // const [lastAddedColumnId, setLastAddedColumnId] = useState<string | null>(null);
  // SortableContent yêu cầu items dạng ['id-1', 'id-2'] chứ không phải [{id: 'id-1', id: 'id-2'}]
  // nếu không đúng thì vẫn kéo thả được nhưng không có animation
  const [openNewColumnForm, setOpenNewColumnForm] = useState<boolean>(false)
  const [newColumnTitle, setNewColumnTitle] = useState<string>('')
  const toggleOpenNewColumnForm = () => {
    setOpenNewColumnForm(!openNewColumnForm)
    setNewColumnTitle('')
  }

  const addNewColumn = async () => {
    if (!newColumnTitle) {
      alert("Column title is required")
      return
    }

    const newColumnData = {
      title: newColumnTitle
    }

    const res = await fetch("/api/columns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...newColumnData,
        boardId: currentActiveBoard?.id,
      }),
    })
    const data = await res.json()
    const createdColumn: Column | null = data?.success ? data.data : null

    if (createdColumn) {
      createdColumn.cards = [generatePlaceholderCard(createdColumn as Column)]
      createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn as Column).id]
    }

    const newBoard = { ...currentActiveBoard }
    newBoard.columns?.push(createdColumn as Column)
    newBoard.columnOrderIds?.push(createdColumn?.id as string)
    setCurrentActiveBoard(newBoard as typeof currentActiveBoard)

    toggleOpenNewColumnForm()
    setNewColumnTitle('')
  }

  const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault() // Thêm dòng này để khi Enter không bị nhảy dòng
      if (!(event.target as HTMLInputElement)?.value) return

      addNewColumn()
    }
  }

  useEffect(() => {
    if (currentActiveBoard?.id) {
      subscribeToBoard(currentActiveBoard.id);
      subscribeToColumn(currentActiveBoard.id)
      subscribeToCard(currentActiveBoard.id)

    }
  }, [currentActiveBoard?.id, subscribeToBoard]);

  const columnIds = columns?.map((column) => column.id)

  return (
    <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
      <div className="w-full h-full flex gap-4 overflow-x-auto pb-4 scrollbar-custom">
        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column}  />
        ))}
        {!openNewColumnForm
          ? <div className="w-60 min-w-60 h-fit">
            
            <Button
              onClick={toggleOpenNewColumnForm}
              className="w-full"
            >
              <CirclePlus />
              Add new column
            </Button>
          </div>
          : <div className="min-w-60 w-60 p-2 rounded-md h-fit flex flex-col gap-1">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={handleKeydown}
              type="text"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <Button
                className="interceptor-loading"
                onClick={addNewColumn}
              >
                Add column
              </Button>
              <X
                onClick={toggleOpenNewColumnForm}
              />
            </div>
          </div>
        }
        <CardDetail />
      </div>
    </SortableContext>
  )
}
