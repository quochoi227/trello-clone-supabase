"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Calendar, 
  CheckSquare, 
  Users, 
  Paperclip,
  AlignLeft,
  MessageSquare,
  Trash,
  Trash2Icon,
  Image,
  Ellipsis,
} from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
  const [cardData, setCardData] = useState(mockCardData)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState(cardData.description)
  const [newComment, setNewComment] = useState("")
  const [showCommentEditor, setShowCommentEditor] = useState(false)

  const { currentActiveCard, setCurrentActiveCard } = useCardStore()
  const { currentActiveBoard, setCurrentActiveBoard, updateCardInBoard } = useBoardStore()

  const handleSaveDescription = () => {
    setCardData({ ...cardData, description })
    setIsEditingDescription(false)
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Here you would add the comment to activities
      setNewComment("")
      setShowCommentEditor(false)
    }
  }

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
    await deleteCard(currentActiveCard?.id as string)
    const board = { ...currentActiveBoard }
    const column = board?.columns?.find(col => col.id === currentActiveCard?.columnId)
    if (column) {
      column.cards = column.cards.filter(card => card.id !== currentActiveCard?.id)
    }
    setCurrentActiveCard(null)
    setCurrentActiveBoard(board as typeof currentActiveBoard)
  }

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
              <ToggleFocusInput style={{ fontSize: 20 }} value={currentActiveCard?.title as string} onChangedValue={handleChangeCardTitle} />
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
                {cardData.labels.map((label) => (
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
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Description</h3>
                </div>
                {!isEditingDescription && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>

              {isEditingDescription ? (
                <div className="space-y-3">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="Add a more detailed description..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveDescription}>
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setDescription(cardData.description)
                        setIsEditingDescription(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tip: Supports Markdown formatting
                  </p>
                </div>
              ) : (
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-hr:my-4"
                  onClick={() => setIsEditingDescription(true)}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cardData.description || "*Click to add description*"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
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
              <div className="space-y-2">
                {showCommentEditor ? (
                  <div className="space-y-2">
                    <Textarea
                      autoFocus
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="min-h-[80px] text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddComment}>
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setNewComment("")
                          setShowCommentEditor(false)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports Markdown
                    </p>
                  </div>
                ) : (
                  <Input
                    placeholder="Write a comment..."
                    onFocus={() => setShowCommentEditor(true)}
                    className="cursor-text"
                  />
                )}
              </div>

              <Separator />

              {/* Activity feed */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {cardData.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback 
                        style={{ backgroundColor: activity.user.color }}
                        className="text-white text-xs font-semibold"
                      >
                        {activity.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user.name}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>
                      </p>
                      <a href="#" className="text-xs text-blue-600 hover:underline">
                        {activity.timestamp}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
