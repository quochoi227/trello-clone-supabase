"use client";

import { Card, Column } from "./kanban-board";
import { KanbanCard } from "./kanban-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Ellipsis, GripVertical, Plus, X } from "lucide-react";
import ToggleFocusInput from "./toggle-focus-input";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { startTransition, useMemo, useOptimistic, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "../ui/input";
import { useBoardStore } from "@/stores/board-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2Icon } from "lucide-react"
import { deleteColumn } from "@/actions/column-action";
import { createCard } from "@/actions/card-actions";
import { toast } from "sonner";
import { generatePlaceholderCard } from "@/utils/formatters";

interface KanbanColumnProps {
  column: Column;
}

type OptimisticCardAction =
  | { type: "add"; card: Card }
  | { type: "replace"; tempId: string; card: Card }
  | { type: "remove"; tempId: string };

const dedupeCardsById = (items: Card[]): Card[] => {
  const map = new Map<string, Card>();
  items.forEach((item) => {
    map.set(item.id, item);
  });
  return Array.from(map.values());
};

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { currentActiveBoard, setCurrentActiveBoard } = useBoardStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column.id,
    data: { ...column }
  })
  // Nếu sử dụng CSS.Transform như docs sẽ lỗi kiểu stretch
  const dndKitColumnStyles = {
    touchAction: 'none', // Dành cho pointer event dạng pointer sensor
    transform: CSS.Translate.toString(transform),
    transition,
    // Chiều cao phải luôn 100% vì nếu không sẽ lỗi lúc kéo column, kết hợp với {...listeners} ở Box chứ không phải div
    height: '100%',
    opacity: isDragging ? '0.5' : undefined
  }

  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => {
    setOpenNewCardForm(!openNewCardForm)
    setNewCardTitle('')
  }

  const [newCardTitle, setNewCardTitle] = useState('')
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [optimisticCards, dispatchOptimisticCard] = useOptimistic(
    column.cards || [],
    (state: Card[], action: OptimisticCardAction) => {
      if (action.type === "add") {
        const withoutPlaceholder = state.filter((card) => !card.FE_PlaceholderCard)
        return dedupeCardsById([...withoutPlaceholder, action.card])
      }

      if (action.type === "replace") {
        const withoutTemp = state.filter((card) => card.id !== action.tempId)
        return dedupeCardsById([...withoutTemp, action.card])
      }

      const nextCards = state.filter((card) => card.id !== action.tempId)
      if (nextCards.length === 0) return [generatePlaceholderCard(column)] as Card[]
      return nextCards
    }
  )

  const addNewCard = async () => {
    if (!newCardTitle.trim() || !currentActiveBoard) {
      toast.error("Card title is required")
      return
    }

    const title = newCardTitle.trim()
    const boardId = currentActiveBoard.id
    const tempId = `temp-card-${crypto.randomUUID()}`
    const optimisticCard: Card = {
      id: tempId,
      title,
      boardId,
      columnId: column.id,
    }

    startTransition(() => {
      dispatchOptimisticCard({ type: "add", card: optimisticCard })
    })
    setIsCreatingCard(true)

    toggleOpenNewCardForm()
    setNewCardTitle('')

    try {
      const { success, error, data } = await createCard({
        boardId,
        columnId: column.id,
        title,
      })

      if (!success || !data) {
        throw new Error(error || "Create card failed")
      }

      const createdCard = data as Card

      startTransition(() => {
        dispatchOptimisticCard({
          type: "replace",
          tempId,
          card: createdCard,
        })
      })

      const latestBoard = useBoardStore.getState().currentActiveBoard
      if (!latestBoard) return

      const nextColumns = latestBoard.columns.map((boardColumn) => {
        if (boardColumn.id !== column.id) return boardColumn

        const baseCards = boardColumn.cards.filter(
          (card) => !card.FE_PlaceholderCard && card.id !== tempId
        )
        // const hasCard = baseCards.some((card) => card.id === createdCard.id)
        // const mergedCards = hasCard ? baseCards : [...baseCards, createdCard]

        const mergedCards = dedupeCardsById([...baseCards, createdCard])

        return {
          ...boardColumn,
          cards: mergedCards,
          cardOrderIds: mergedCards.map((card) => card.id),
        }
      })

      setCurrentActiveBoard({
        ...latestBoard,
        columns: nextColumns,
      } as typeof currentActiveBoard)
    } catch (e) {
      startTransition(() => {
        dispatchOptimisticCard({ type: "remove", tempId })
      })
      toast.error(e instanceof Error ? e.message : "Failed to create card")
    } finally {
      setIsCreatingCard(false)
    }
  }

  const handleDeleteColumn = () => {
    const newBoard = { ...currentActiveBoard }
    // Không vi phạm Immutability của Redux
    newBoard.columns = newBoard?.columns?.filter((c) => c.id !== column.id)
    newBoard.columnOrderIds = newBoard?.columnOrderIds?.filter((_id) => _id !== column.id)
    // setBoard(newBoard)
    setCurrentActiveBoard(newBoard as typeof currentActiveBoard)
    // Gọi API
    deleteColumn(column.id, currentActiveBoard?.id as string)
  }

  const cardIds = useMemo(() => {
    return optimisticCards?.map((card) => card.id) || []
  }, [optimisticCards])

  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} className="h-full">
      <div {...attributes} className="flex flex-col w-[272px] bg-[#f1f2f4] dark:bg-slate-800 rounded-2xl">
        <div className="h-[52px] flex items-center gap-2 p-2 pb-1.5">
          <ToggleFocusInput style={{ flex: 1 }} value={column.title} onChangedValue={(value) => {console.log(value)}} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Board settings</DropdownMenuItem>
              <DropdownMenuItem>Change visibility</DropdownMenuItem>
              <DropdownMenuItem>Archive board</DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete column</Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                      <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                    <AlertDialogDescription>  
                      This will permanently delete this column. View{" "}
                      <a href="#">Settings</a> delete any memories saved during this column.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteColumn} variant="destructive">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className="pr-1"
        >
          <div className="max-h-[434px] flex flex-col overflow-auto scrollbar-custom gap-2 px-2 pb-1 pr-1">
            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
              {optimisticCards?.map((card) => {
                return <KanbanCard key={card.id} card={card} />;
              })}
            </SortableContext>
          </div>
        </div>
        <div className="h-[52px] p-2 pb-1.5">
          {!openNewCardForm ? (
          <div className="h-full flex items-center gap-2">
            <Button
            onClick={toggleOpenNewCardForm}
            variant="ghost" className="flex-1 justify-start px-3">
              <Plus />
              Add a card
            </Button>
            <Button {...listeners} variant="ghost" size="icon" className="cursor-grab active:cursor-grabbing">
              <GripVertical />
            </Button>
          </div>
          ) : (
            <div
              className="h-full flex items-center gap-1"
            >
              <Input autoFocus value={newCardTitle} onChange={(e) => setNewCardTitle(e.target.value)} />
              <div className="flex items-center gap-1">
                <Button disabled={isCreatingCard} onClick={addNewCard}>
                  Add
                </Button>
                <X
                  onClick={toggleOpenNewCardForm}
                  className='cursor-pointer'
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
