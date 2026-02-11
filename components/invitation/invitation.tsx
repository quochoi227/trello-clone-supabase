"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { acceptBoardInvitation, declineBoardInvitation } from "@/actions/board-invitation-actions"
import { InvitationWithDetails } from "@/types/invitation"
import { Check, X } from "lucide-react"

interface InvitationProps {
  invitation: InvitationWithDetails
  onResponse?: () => void
}

export function Invitation({ invitation, onResponse }: InvitationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<InvitationWithDetails["status"]>(invitation.status ?? null)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      await acceptBoardInvitation({ invitationId: invitation.id })
      setStatus("accepted")
      onResponse?.()
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
      onResponse?.()
    } catch (error) {
      console.error("Error declining invitation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (status === "accepted") {
      return (
        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
          <Check className="w-3 h-3 mr-1" />
          Accepted
        </Badge>
      )
    }
    if (status === "declined") {
      return (
        <Badge variant="destructive" className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20">
          <X className="w-3 h-3 mr-1" />
          Declined
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-yellow-600 dark:text-yellow-400">
        Pending
      </Badge>
    )
  }

  return (
    <Alert className="max-w-md">
      <AlertTitle>
        Board Invitation
      </AlertTitle>
      <AlertTitle className="col-start-9">
        {new Date(invitation.created_at).toLocaleDateString("vi-VN", {
           day: "2-digit",
           month: "2-digit",
           year: "numeric",
           hour: "2-digit",
           minute: "2-digit",
         })}
      </AlertTitle>
      <AlertDescription className="">
        Someone invited you to join{" "}
        <span className="font-medium text-foreground">
          {invitation.board?.title || "a board"}
        </span>
      </AlertDescription>
      <div className="mt-1 flex gap-2 col-start-1">
        {status === "pending" ? (
          <>
            <Button onClick={handleAccept} size="xs" variant="default">
              Accept
            </Button>
            <Button onClick={handleDecline} size="xs" variant="destructive">
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
      
    </Alert>
  )
}
