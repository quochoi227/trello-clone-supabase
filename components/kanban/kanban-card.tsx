"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardType } from "./kanban-board";
import { Card } from "@/components/ui/card";
import { MessageSquare, Paperclip, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  card: CardType;
  isOverlay?: boolean;
}

export function KanbanCard({ card, isOverlay = false }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {...card},
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none'
  };

  const shouldShowCardActions: boolean =
  !!card?.memberIds?.length ||
  !!card?.comments?.length ||
  !!card?.attachments?.length

  const CardContent = () => (
    <>
      {card.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.cover}
          alt={card.title || "Card image"}
          className="w-full h-32 object-cover rounded-t-[8px]"
        />
      )}
      <div className="p-3">
        <h4 className={cn({ "mb-2": shouldShowCardActions }, "font-medium text-sm")}>{card.title}</h4>
        {card.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {card.description}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {card.memberIds && card.memberIds.length > 0 && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{card.memberIds.length}</span>
            </div>
          )}
          {card.comments && card.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{card.comments.length}</span>
            </div>
          )}
          {card.attachments && card.attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              <span>{card.attachments.length}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (isOverlay) {
    return (
      <Card className="p-3 bg-background shadow-lg">
        <CardContent />
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn({ "hidden": card?.FE_PlaceholderCard }, "bg-background rounded-[8px] shadow-[0px_1px_1px_#1E1F2140]")}
    >
      <CardContent />
    </Card>
  );
}
