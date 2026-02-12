"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"


import { 
  Plus, 
  Calendar, 
  CheckSquare, 
  Users, 
  Paperclip,
  MessageSquare,
  Trash,
  Trash2Icon,
  Image,
  Ellipsis,
} from "lucide-react"
import { useCardStore } from "@/stores/card-store"
import ToggleFocusInput from "@/components/kanban/toggle-focus-input"
import { deleteCard, updateCard } from "@/actions/card-actions"
import { useBoardStore } from "@/stores/board-store"

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
import CardActivities from "./card-activities"
import CardDescription from "./card-description"
import { Card } from "@/components/kanban"
import { useEffect } from "react"

// Mock data structure
interface Label {
  id: string
  color: string
  name?: string
}

interface Activity {
  id: string
  user: {
    name: string
    avatar: string
    initials: string
    color: string
  }
  action: string
  timestamp: string
}

interface CardData {
  id: string
  title: string
  description: string
  labels: Label[]
  activities: Activity[]
}

// Mock card data based on the image
const mockCardData: CardData = {
  id: "1",
  title: "Oberbrunner Ltd",
  description: `## Company Name

## Company Contact

---

## Case description`,
  labels: [
    { id: "1", color: "#4ade80", name: "active" }
  ],
  activities: [
    {
      id: "1",
      user: {
        name: "Phan Quốc Bình",
        initials: "PB",
        avatar: "",
        color: "#f97316"
      },
      action: "moved this card from Done to In review",
      timestamp: "Jan 23, 2026, 10:09 PM"
    },
    {
      id: "2",
      user: {
        name: "Phan Quốc Bình",
        initials: "PB",
        avatar: "",
        color: "#f97316"
      },
      action: "moved this card from In progress to Done",
      timestamp: "Jan 23, 2026, 10:09 PM"
    },
    {
      id: "3",
      user: {
        name: "Bình Thái",
        initials: "BT",
        avatar: "",
        color: "#10b981"
      },
      action: "marked this card as incomplete",
      timestamp: "Jan 23, 2026, 10:06 PM"
    },
    {
      id: "4",
      user: {
        name: "Bình Thái",
        initials: "BT",
        avatar: "",
        color: "#10b981"
      },
      action: "marked this card as complete",
      timestamp: "Jan 23, 2026, 10:06 PM"
    },
    {
      id: "5",
      user: {
        name: "Ngo Quoc Cuong B2303801",
        initials: "NB",
        avatar: "",
        color: "#ef4444"
      },
      action: "moved this card from On Hold to Win",
      timestamp: "Jan 23, 2026, 9:53 PM"
    },
    {
      id: "6",
      user: {
        name: "Ngo Quoc Cuong B2303801",
        initials: "NB",
        avatar: "",
        color: "#ef4444"
      },
      action: "moved this card from Lost to On Hold",
      timestamp: "Jan 23, 2026, 9:53 PM"
    }
  ]
}

export default function CardDetail() {
  const { currentActiveCard, setCurrentActiveCard, subscribeToActivity } = useCardStore()
  const { currentActiveBoard, setCurrentActiveBoard, updateCardInBoard } = useBoardStore()  

  const handleOpenChanege = (isOpen: boolean) => {
    if (!isOpen) {
      setCurrentActiveCard(null)
    }
  }

  const handleChangeCardTitle = async (newTitle: string) => {
    const updateResult = await updateCard(currentActiveCard?.id as string, { title: newTitle })
    if (updateResult) {
      updateCardInBoard(updateResult.data)
    }
  }

  const handleDeleteCard = async () => {
    // Implement delete card logic here
    await deleteCard(currentActiveCard?.id as string, currentActiveCard?.columnId as string)
    const board = { ...currentActiveBoard }
    const column = board?.columns?.find(col => col.id === currentActiveCard?.columnId)
    if (column) {
      column.cards = column.cards.filter(card => card.id !== currentActiveCard?.id)
    }
    setCurrentActiveCard(null)
    setCurrentActiveBoard(board as typeof currentActiveBoard)
  }

  useEffect(() => {
    if (currentActiveCard) {
      // Subscribe to card updates
      subscribeToActivity(currentActiveCard.id as string)
    }
  }, [currentActiveCard?.id, subscribeToActivity])

  return (
    <Dialog open={!!currentActiveCard} onOpenChange={handleOpenChanege}>
      <DialogContent className="sm:max-w-5xl p-0 gap-0">
        <DialogHeader className="border-b border-slate-200 min-h-12">
          <DialogTitle className="hidden"></DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
          <div className="w-full flex h-full items-start justify-end gap-2 pt-1.5 pr-12">
            <Button variant="outline" size="icon" className="rounded-full">
              <Image />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Ellipsis />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex flex-col md:flex-row max-h-[80vh] pb-1">
          {/* Left side - Card details */}
          <div className="flex-1 p-6 space-y-6 max-h-full overflow-y-auto scrollbar-custom">
            {/* Title with checkbox */}
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                className="mt-1 h-5 w-5 rounded border-gray-300"
              />
              <ToggleFocusInput style={{ fontSize: 20 }} value={currentActiveCard?.title as string || ""} onChangedValue={handleChangeCardTitle} />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Dates
              </Button>
              <Button variant="outline" size="sm">
                <CheckSquare className="w-4 h-4 mr-2" />
                Checklist
              </Button>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Members
              </Button>
              <Button variant="outline" size="sm">
                <Paperclip className="w-4 h-4 mr-2" />
                Attachment
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-red-300/20 hover:bg-red-300/50 text-red-500" size="sm">
                    <Trash />
                    Delete card
                  </Button>
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
                    <AlertDialogAction onClick={handleDeleteCard} variant="destructive">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Labels */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Labels</h3>
              <div className="flex items-center gap-2">
                {mockCardData.labels.map((label) => (
                  <div
                    key={label.id}
                    className="h-8 w-20 rounded"
                    style={{ backgroundColor: label.color }}
                  />
                ))}
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <CardDescription cardData={currentActiveCard as Card} />
          </div>

          {/* Right side - Comments and activity */}
          <div className="w-full md:w-96 border-l bg-muted/20  max-h-full overflow-y-auto scrollbar-custom">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="text-sm font-semibold">Comments and activity</h3>
                </div>
                <Button variant="ghost" size="sm">
                  Hide details
                </Button>
              </div>

              {/* Comment input */}
              <CardActivities cardData={currentActiveCard as Card} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
