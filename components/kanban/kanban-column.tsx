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
import { useMemo, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "../ui/input";
import { useBoardStore } from "@/stores/board-store";
import { cloneDeep } from "lodash";
import { createCard } from "@/actions/card-actions";
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

interface KanbanColumnProps {
  column: Column;
}

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

  const addNewCard = async () => {
    if (!newCardTitle) {
      // toast("Vui lòng nhập tên thẻ", {
      //     description: "Không thể tạo thẻ với tên trống.",
      //   })
      alert("Card title is required")
      return
    }
    const newCardData = {
      title: newCardTitle,
      columnId: column.id
    }

    // gọi api tạo mới column và làm lại dữ liệu State Board
    const { data: createdCard } = await createCard({
      ...newCardData,
      boardId: currentActiveBoard?.id as string,
    })

    // console.log('Created card:', createdCard)

    // console.log('Gọi API tạo mới card với title:', newCardTitle)
    // const createdCard: Card = {
    //   id: `card-${Date.now()}`,
    //   title: newCardTitle,
    //   boardId: currentActiveBoard?.id as string,
    //   columnId: column.id,
    //   description: '',
    //   attachments: [],
    //   comments: []
    // }

    // tự làm lại state Board thay vì gọi lại fetchBoardAPI
    // const newBoard = { ...board }
    // Tương tự createNewColumn, chỗ này phải dùng deep copy (cloneDeep)
    const newBoard = cloneDeep(currentActiveBoard)
    const columnToUpdate = newBoard?.columns.find((column) => column.id === createdCard?.columnId)
    if (columnToUpdate) {
      // Trường hợp mảng cards rỗng
      if (columnToUpdate.cards.some((card) => card.FE_PlaceholderCard)) {
        columnToUpdate.cards = [createdCard as Card]
        columnToUpdate.cardOrderIds = [createdCard?.id as string]
      } else {
        // Ngược lại
        columnToUpdate.cards.push(createdCard as Card)
        columnToUpdate.cardOrderIds.push(createdCard?.id as string)
      }
    }
    // // setBoard(newBoard)
    // dispatch(updateCurrentActiveBoard(newBoard))
    setCurrentActiveBoard(newBoard as typeof currentActiveBoard)

    toggleOpenNewCardForm()
    setNewCardTitle('')
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
    return column.cards.map((card) => card.id)
  }, [column.cards])

  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} className="h-full">
      <div {...attributes} className="flex flex-col w-[272px] bg-[#f1f2f4] dark:bg-slate-800 rounded-2xl">
        <div className="h-[44px] flex items-center gap-2 p-2 pb-1.5">
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
              {column.cards.map((card) => {
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
                <Button onClick={addNewCard}>
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
