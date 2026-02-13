"use client"

import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Board, Column } from "./kanban-board";
import { KanbanColumn } from "./kanban-column";
import { Button } from "../ui/button";
import { CirclePlus, X } from "lucide-react";
import { Input } from "../ui/input";
import { startTransition, useEffect, useOptimistic, useState } from "react";
import { generatePlaceholderCard } from "@/utils/formatters";
// import { cloneDeep } from "lodash";
import { useBoardStore } from "@/stores/board-store";
import CardDetail from "@/app/boards/[id]/_components/card/card-detail";
import { toast } from "sonner";

type OptimisticColumnAction =
  | { type: "add"; column: Column }
  | { type: "replace"; tempId: string; column: Column }
  | { type: "remove"; tempId: string };

const withPlaceholderCard = (column: Column): Column => {
  if (column.cards?.length) {
    return {
      ...column,
      cardOrderIds: column.cardOrderIds?.length
        ? column.cardOrderIds
        : column.cards.map((card) => card.id),
    };
  }

  const placeholder = generatePlaceholderCard(column);
  return {
    ...column,
    cards: [placeholder],
    cardOrderIds: [placeholder.id],
  };
};

const normalizeCreatedColumn = (rawColumn: Partial<Column> & { board_id?: string; card_order_ids?: string[] }, boardId: string): Column => {
  return {
    ...(rawColumn as Column),
    boardId: rawColumn.boardId ?? rawColumn.board_id ?? boardId,
    cards: rawColumn.cards ?? [],
    cardOrderIds: rawColumn.cardOrderIds ?? rawColumn.card_order_ids ?? [],
  };
};

const dedupeColumnsById = (items: Column[]): Column[] => {
  const map = new Map<string, Column>();
  items.forEach((item) => {
    map.set(item.id, item);
  });
  return Array.from(map.values());
};

export function ListColumns({ columns }: { columns: Board["columns"] }) {
  const { currentActiveBoard, setCurrentActiveBoard, subscribeToBoard, subscribeToColumn, subscribeToCard } = useBoardStore()
  // const [lastAddedColumnId, setLastAddedColumnId] = useState<string | null>(null);
  // SortableContent yêu cầu items dạng ['id-1', 'id-2'] chứ không phải [{id: 'id-1', id: 'id-2'}]
  // nếu không đúng thì vẫn kéo thả được nhưng không có animation
  const [openNewColumnForm, setOpenNewColumnForm] = useState<boolean>(false)
  const [newColumnTitle, setNewColumnTitle] = useState<string>('')
  const [isCreatingColumn, setIsCreatingColumn] = useState(false)
  const [optimisticColumns, dispatchOptimisticColumn] = useOptimistic(
    columns,
    (state: Column[], action: OptimisticColumnAction) => {
      if (action.type === "add") {
        return dedupeColumnsById([...state, action.column]);
      }

      if (action.type === "replace") {
        const withoutTemp = state.filter((column) => column.id !== action.tempId);
        return dedupeColumnsById([...withoutTemp, action.column]);
      }

      return state.filter((column) => column.id !== action.tempId);
    }
  )

  const toggleOpenNewColumnForm = () => {
    setOpenNewColumnForm(!openNewColumnForm)
    setNewColumnTitle('')
  }

  const addNewColumn = async () => {
    if (!newColumnTitle?.trim() || !currentActiveBoard) {
      toast.error("Column title is required")
      return
    }

    const title = newColumnTitle.trim()
    const boardId = currentActiveBoard.id
    const tempId = `temp-${crypto.randomUUID()}`

    const optimisticColumn = withPlaceholderCard({
      id: tempId,
      title,
      boardId,
      cards: [],
      cardOrderIds: []
    } as Column)

    startTransition(() => {
      dispatchOptimisticColumn({ type: "add", column: optimisticColumn })
    })

    const boardBeforeCreate = useBoardStore.getState().currentActiveBoard
    if (boardBeforeCreate) {
      const mergedColumns = dedupeColumnsById([
        ...(boardBeforeCreate.columns || []),
        optimisticColumn,
      ])
      const mergedColumnOrderIds = Array.from(
        new Set([...(boardBeforeCreate.columnOrderIds || []), tempId])
      )

      setCurrentActiveBoard({
        ...boardBeforeCreate,
        columns: mergedColumns,
        columnOrderIds: mergedColumnOrderIds,
      } as typeof currentActiveBoard)
    }

    setIsCreatingColumn(true)

    // UX: đóng form ngay
    toggleOpenNewColumnForm()
    setNewColumnTitle("")

    try {
      // const { success, error, data } = await createColumn({ title, boardId })
      const response = await fetch('/api/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, boardId }),
      })

      if (!response.ok) {
        throw new Error("Failed to create column")
      }

      const { success, error, data } = await response.json()
      
      if (!success || !data) {
        throw new Error(error || "Create column failed")
      }

      const createdColumn = withPlaceholderCard(
        normalizeCreatedColumn(data as Partial<Column> & { board_id?: string; card_order_ids?: string[] }, boardId)
      )

      startTransition(() => {
        dispatchOptimisticColumn({
          type: "replace",
          tempId,
          column: createdColumn,
        })
      })

      const latestBoard = useBoardStore.getState().currentActiveBoard
      if (!latestBoard) return

      const replacedColumns = (latestBoard.columns || []).map((column) =>
        column.id === tempId ? createdColumn : column
      );
      const mergedColumns = dedupeColumnsById(replacedColumns);

      const replacedColumnOrderIds = (latestBoard.columnOrderIds || []).map((id) =>
        id === tempId ? createdColumn.id : id
      );
      const mergedColumnOrderIds = Array.from(new Set(replacedColumnOrderIds));

      setCurrentActiveBoard({
        ...latestBoard,
        columns: mergedColumns,
        columnOrderIds: mergedColumnOrderIds
      } as typeof currentActiveBoard)
    } catch (e) {
      startTransition(() => {
        dispatchOptimisticColumn({ type: "remove", tempId })
      })

      const latestBoard = useBoardStore.getState().currentActiveBoard
      if (latestBoard) {
        setCurrentActiveBoard({
          ...latestBoard,
          columns: latestBoard.columns.filter((column) => column.id !== tempId),
          columnOrderIds: latestBoard.columnOrderIds.filter((id) => id !== tempId),
        } as typeof currentActiveBoard)
      }

      toast.error(e instanceof Error ? e.message : "Failed to create column")
    } finally {
      setIsCreatingColumn(false)
    }
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
  }, [currentActiveBoard?.id, subscribeToBoard, subscribeToColumn, subscribeToCard]);

  const columnIds = optimisticColumns?.map((column) => column.id)

  return (
    <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
      <div className="w-full h-full flex gap-4 overflow-x-auto pb-4 scrollbar-custom">
        {optimisticColumns.map((column) => (
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
                disabled={isCreatingColumn}
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
