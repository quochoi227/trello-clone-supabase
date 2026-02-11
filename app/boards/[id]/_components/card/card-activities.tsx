import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Card } from "@/components/kanban"
import CardActivity from "./card-activity"
import { useCardStore } from "@/stores/card-store"

// const mockCardData = {
//   id: "1",
//   title: "Oberbrunner Ltd",
//   description: `## Company Name

// ## Company Contact

// ---

// ## Case description`,
//   labels: [
//     { id: "1", color: "#4ade80", name: "active" }
//   ],
//   activities: [
//     {
//       id: "1",
//       user: {
//         name: "Phan Quốc Bình",
//         initials: "PB",
//         avatar: "",
//         color: "#f97316"
//       },
//       action: "moved this card from Done to In review",
//       timestamp: "Jan 23, 2026, 10:09 PM"
//     },
//     {
//       id: "2",
//       user: {
//         name: "Phan Quốc Bình",
//         initials: "PB",
//         avatar: "",
//         color: "#f97316"
//       },
//       action: "moved this card from In progress to Done",
//       timestamp: "Jan 23, 2026, 10:09 PM"
//     },
//     {
//       id: "3",
//       user: {
//         name: "Bình Thái",
//         initials: "BT",
//         avatar: "",
//         color: "#10b981"
//       },
//       action: "marked this card as incomplete",
//       timestamp: "Jan 23, 2026, 10:06 PM"
//     },
//     {
//       id: "4",
//       user: {
//         name: "Bình Thái",
//         initials: "BT",
//         avatar: "",
//         color: "#10b981"
//       },
//       action: "marked this card as complete",
//       timestamp: "Jan 23, 2026, 10:06 PM"
//     },
//     {
//       id: "5",
//       user: {
//         name: "Ngo Quoc Cuong B2303801",
//         initials: "NB",
//         avatar: "",
//         color: "#ef4444"
//       },
//       action: "moved this card from On Hold to Win",
//       timestamp: "Jan 23, 2026, 9:53 PM"
//     },
//     {
//       id: "6",
//       user: {
//         name: "Ngo Quoc Cuong B2303801",
//         initials: "NB",
//         avatar: "",
//         color: "#ef4444"
//       },
//       action: "moved this card from Lost to On Hold",
//       timestamp: "Jan 23, 2026, 9:53 PM"
//     }
//   ]
// }

interface IProps {
  cardData: Card
}

function CardActivities({ cardData }: IProps) {
  const { currentActiveCard, setCurrentActiveCard } = useCardStore()

  const [newComment, setNewComment] = useState("")
  const [showCommentEditor, setShowCommentEditor] = useState(false)

  const handleAddComment = async () => {
    if (newComment.trim()) {
      // Here you would add the comment to activities
      // Call action to add comment activity
      fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cardId: cardData.id,
          boardId: cardData.boardId,
          actionType: 'comment_added',
          data: { content: newComment.trim() }
        })
      }).then(res => res.json())
      .then(data => {
          setNewComment("")
          setShowCommentEditor(false)
          setCurrentActiveCard({
            ...currentActiveCard!,
            // Append new activity to activities list
            activities: [data, ... (currentActiveCard?.activities || [])]
          } as Card)
        }
      )
    }
  }

  useEffect(() => {
    fetch('/api/activities?cardId=' + cardData.id)
      .then(res => res.json())
      .then(data => {
        setCurrentActiveCard({
          ...currentActiveCard!,
          activities: data || []
        } as Card)
      })
  }, [])

  return (
    <div className="space-y-4">
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
      <div className="space-y-2 max-h-[500px]">
        {currentActiveCard?.activities?.map((activity) => (
          <CardActivity key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}

export default CardActivities