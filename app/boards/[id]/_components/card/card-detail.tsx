"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


import { 
  Plus, 
  Calendar, 
  CheckSquare, 
  Users, 
  Paperclip,
  MessageSquare,
  Trash,
  Trash2Icon,
  ImageIcon,
  Ellipsis,
} from "lucide-react"
import { useCardStore } from "@/stores/card-store"
import ToggleFocusInput from "@/components/kanban/toggle-focus-input"
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
import { useEffect, useRef, useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

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
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const coverFileInputRef = useRef<HTMLInputElement | null>(null)

  const handleOpenChanege = (isOpen: boolean) => {
    if (!isOpen) {
      setCurrentActiveCard(null)
    }
  }

  const handleChangeCardTitle = async (newTitle: string) => {
    // const updateResult = await updateCard(currentActiveCard?.id as string, { title: newTitle })
    const response = await fetch(`/api/cards/${currentActiveCard?.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTitle }),
    })

    const updateResult = await response.json()
    
    if (updateResult?.success && updateResult?.data) {
      updateCardInBoard(updateResult.data)
      if (currentActiveCard) {
        setCurrentActiveCard({ ...currentActiveCard, ...updateResult.data })
      }
    }
  }

  const handleOpenCoverUpload = () => {
    coverFileInputRef.current?.click()
  }

  const handleChangeCardCover = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile || !currentActiveCard?.id) return

    try {
      setIsUploadingCover(true)
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch(`/api/cards/${currentActiveCard.id}/cover`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result?.success || !result?.data) {
        throw new Error(result?.error || "Upload cover failed")
      }

      updateCardInBoard(result.data)
      setCurrentActiveCard({ ...currentActiveCard, ...result.data })
      toast.success("Upload cover thành công")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể upload cover")
    } finally {
      setIsUploadingCover(false)
      event.target.value = ""
    }
  }

  const handleDeleteCard = async () => {
    // Implement delete card logic here
    // await deleteCard(currentActiveCard?.id as string, currentActiveCard?.columnId as string)
    await fetch(`/api/cards/${currentActiveCard?.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ columnId: currentActiveCard?.columnId }),
    })
    
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
  }, [currentActiveCard, subscribeToActivity])

  return (
    <Dialog open={!!currentActiveCard} onOpenChange={handleOpenChanege}>
      <DialogContent className="sm:max-w-5xl p-0 gap-0">
        <DialogHeader className={cn("border-b border-slate-200", currentActiveCard?.cover ? "h-36" : "h-12")}>
          <DialogTitle className="hidden"></DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
          <div className="relative w-full flex h-full items-start justify-end gap-2 pt-1.5 pr-12">
            {currentActiveCard?.cover && (
              <div className="absolute -z-10 left-0 top-0 w-full h-full rounded-md overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentActiveCard.cover}
                  alt={currentActiveCard.title || "Card cover"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChangeCardCover}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <ImageIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="p-3 pt-1 min-w-[300px]">
                <DropdownMenuLabel className="text-center text-muted-foreground">Cover</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Attachments</DropdownMenuLabel>
                  <DropdownMenuItem asChild onSelect={(event) => event.preventDefault()}>
                    <Button
                      variant="secondary"
                      className="w-full cursor-pointer"
                      type="button"
                      onClick={handleOpenCoverUpload}
                      disabled={isUploadingCover || !currentActiveCard?.id}
                    >
                      {isUploadingCover ? "Uploading..." : "Upload a cover image"}
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" className="rounded-full">
              <Ellipsis />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex flex-col md:flex-row max-h-[80vh] pb-1">
          {/* Left side - Card details */}
          <div className="flex-1 p-6 space-y-6 max-h-full overflow-y-auto scrollbar-custom">
            {/* Title with checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox />
              <ToggleFocusInput style={{ fontSize: 18 }} value={currentActiveCard?.title as string || ""} onChangedValue={handleChangeCardTitle} />
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
