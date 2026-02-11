"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
// import { sendBoardInvitation } from "@/actions/board-invitation-actions";
import { useBoardStore } from "@/stores/board-store";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

function BoardInvitation() {
  const { currentActiveBoard } = useBoardStore()
  const [inviteeEmail, setInviteeEmail] = useState<string>("");

  const handleInvite = () => {
    console.log("Invitee Email:", inviteeEmail);
    // sendBoardInvitation({ boardId: currentActiveBoard?.id as string, email: inviteeEmail })
    fetch("/api/invitations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boardId: currentActiveBoard?.id,
        email: inviteeEmail,
      }),
    })
  }

  return (
    <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Users className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">Invite user</h4>
              <p className="text-muted-foreground text-sm">
                Invite people by their email address to collaborate on this board.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  id="email"
                  className="h-8"
                  placeholder="add email address"
                />
              </div>
              <Button onClick={handleInvite} disabled={!inviteeEmail.trim()}>Send Invite</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
  )
}

export default BoardInvitation