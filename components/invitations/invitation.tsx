"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { declineBoardInvitation } from "@/actions/board-invitation-actions"
import { InvitationWithDetails } from "@/types/invitation"
import { Check, Clock3, X } from "lucide-react"

interface InvitationProps {
  invitation: InvitationWithDetails
  onResponse?: (nextStatus: InvitationWithDetails["status"]) => void
}

export function Invitation({ invitation, onResponse }: InvitationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<InvitationWithDetails["status"]>(invitation.status)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/invitations/' + invitation.id + '/accept', {
        method: 'PUT',
        }
      )
      setStatus("accepted")
      onResponse?.("accepted")
    } catch (error) {
      console.error("Error accepting invitation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async () => {
    setIsLoading(true)
    try {
      await declineBoardInvitation({ invitationId: invitation.id })
      setStatus("declined")
      onResponse?.("declined")
    } catch (error) {
      console.error("Error declining invitation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-full border-border/80 bg-card/70 shadow-sm backdrop-blur-sm">
      <CardHeader className="p-2 pb-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock3 className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold text-foreground">
            Board Invitation
            </CardTitle>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(invitation.created_at).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-2 pt-0">
        <CardDescription className="mb-2 text-sm leading-relaxed">
          Someone invited you to join{" "}
          <span className="font-semibold text-foreground">
            {invitation.board?.title || "a board"}
          </span>
        </CardDescription>

        <div className="flex items-center gap-2">
        {status === "pending" ? (
          <>
            <Button disabled={isLoading} onClick={handleAccept} size="xs" variant="default">
              Accept
            </Button>
            <Button disabled={isLoading} onClick={handleDecline} size="xs" variant="outline">
              Decline
            </Button>
          </>
        ) : status === "accepted" ? (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
            <Check className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        ) : (
          <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20">
            <X className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        )}
        </div>
      </CardContent>
    </Card>
  )
}
