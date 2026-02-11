import { Card } from "@/components/kanban"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useCardStore } from "@/stores/card-store"
import { ActivityWithUser } from "@/types/activity"
import { Dot } from "lucide-react"
import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function CardActivity({ activity }: { activity: ActivityWithUser }) {
  const userName = activity.user?.name || "Unknown User"
  const email = activity.user?.email || ""
  const userAvatar = activity.user?.avatar
  
  const [newComment, setNewComment] = useState(activity.data?.content || "")
  const [showCommentEditor, setShowCommentEditor] = useState(false)

  const { setCurrentActiveCard, currentActiveCard } = useCardStore()

  // Get initials from name
  const initials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  const handleEditComment = () => {
    // Handle comment edit logic here
    fetch('/api/activities/' + activity.id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: { content: newComment.trim() }
      })
    })
    .then(res => res.json())
    .then((data) => {
        setShowCommentEditor(false)
        setCurrentActiveCard({
          ...currentActiveCard!,
          activities: currentActiveCard!.activities!.map(act =>
            act.id === activity.id ? { ...act, data: data.data } : act
          )
        } as Card)
      })
  }

  const handleDeleteComment = () => {
    // Handle comment delete logic here
    fetch('/api/activities/' + activity.id, {
      method: 'DELETE',
    })
    .then(res => res.json())
    .then(() => {
        setCurrentActiveCard({
          ...currentActiveCard!,
          activities: currentActiveCard!.activities!.filter(act => act.id !== activity.id)
        } as Card)
      })
  }

  return (
    <div className="flex gap-3 pb-4">
      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
        {userAvatar && <AvatarImage src={userAvatar} alt={email} />}
        <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold text-sm text-foreground">
            {email}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(activity.created_at)}
          </span>
        </div>
        
        <div className="text-sm text-foreground mt-1 break-words">
          {activity.action_type === "comment_added" && (
            !showCommentEditor ? (
              <div>
                <div
                  className="p-2 border border-slate-200 shadow-sm bg-white rounded-md"
                >
                  {activity.data?.content}
                </div>
                <div className="text-xs flex mt-1">
                  <span onClick={() => setShowCommentEditor(true)} className="underline cursor-pointer">Edit</span>
                  <Dot size={16} />
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className="underline cursor-pointer">Delete</span>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="p-3">
                      <div className="flex flex-col gap-2">
                        <div className="text-center font-semibold text-muted-foreground">Delete comment?</div>
                        <p className="text-muted-foreground text-sm">
                          Deleting a comment is forever. There is no undo.
                        </p>
                        <Button onClick={handleDeleteComment} variant="destructive" className="w-full">Delete comment</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Textarea
                  autoFocus
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[80px] text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEditComment}>
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
                    Discard changes
                  </Button>
                </div>
              </div>
            )
          )}
          {activity.action_type === "comment_edited" && (
            <>
              <span className="text-foreground font-medium">edited comment:</span>{" "}
              {activity.data?.content}
            </>
          )}
          {activity.action_type === "card_moved" && (
            <>
              <span className="text-foreground font-medium">moved card</span>{" "}
              from <strong>{activity.data?.fromColumn}</strong> to{" "}
              <strong>{activity.data?.toColumn}</strong>
            </>
          )}
          {activity.action_type === "member_added" && (
            <>
              <span className="text-foreground font-medium">added</span>{" "}
              {activity.data?.memberName} to card
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardActivity