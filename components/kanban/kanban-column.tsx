"use client";

import { Column } from "./kanban-board";
import { KanbanCard } from "./kanban-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Ellipsis, GripVertical, Plus } from "lucide-react";
import ToggleFocusInput from "./toggle-focus-input";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useMemo } from "react";
import { CSS } from "@dnd-kit/utilities";

interface KanbanColumnProps {
  column: Column;
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: column._id,
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

  const cardIds = useMemo(() => {
    return column.cards.map((card) => card._id)
  }, [column.cards])

  return (
    <div ref={setNodeRef} style={dndKitColumnStyles} className="h-full">
      <div {...attributes} className="flex flex-col w-[272px] bg-[#f1f2f4] rounded-2xl">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div
          className="pr-1"
        >
          <div className="max-h-[434px] flex flex-col overflow-auto scrollbar-custom gap-2 px-2 pb-1 pr-1">
            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
              {column.cards.map((card) => {
                return <KanbanCard key={card._id} card={card} />;
              })}
            </SortableContext>
          </div>
        </div>
        <div className="h-[44px] flex items-center gap-2 p-2 pb-1.5">
          <Button variant="ghost" className="flex-1 justify-start px-3">
            <Plus />
            Add a card
          </Button>
          <Button {...listeners} variant="ghost" size="icon" className="cursor-grab active:cursor-grabbing">
            <GripVertical />
          </Button>
        </div>
      </div>
    </div>
  );
}
