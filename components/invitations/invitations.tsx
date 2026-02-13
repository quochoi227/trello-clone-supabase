"use client";

import { useEffect, useMemo, useState } from "react";
import { Invitation } from "../invitations/invitation";
import { InvitationWithDetails } from "@/types/invitation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Invitations() {
  const [invitations, setInvitations] = useState<InvitationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => invitations.filter((invite) => invite.status === "pending").length,
    [invitations]
  );

  useEffect(() => {
    let ignore = false;

    const loadInvitations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/invitations");
        if (!res.ok) {
          throw new Error("Could not load invitations");
        }

        const payload = await res.json();
        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        if (!ignore) {
          setInvitations(list);
        }
      } catch (fetchError) {
        if (!ignore) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch invitations");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadInvitations();

    return () => {
      ignore = true;
    };
  }, []);

  const handleInvitationResponse = (invitationId: string, nextStatus: InvitationWithDetails["status"]) => {
    setInvitations((prev) =>
      prev.map((invitation) =>
        invitation.id === invitationId
          ? { ...invitation, status: nextStatus }
          : invitation
      )
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
        >
          <Bell className="h-4 w-4" />
          {pendingCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[420px] max-w-[90vw] p-0">
        <DropdownMenuLabel className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Invitations</span>
            <Badge variant="secondary" className="font-medium">
              {pendingCount} pending
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[420px] overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading invitations...</div>
          ) : error ? (
            <div className="p-4 text-sm text-destructive">{error}</div>
          ) : invitations.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            invitations.map((invite) => (
              <Invitation
                key={invite.id}
                invitation={invite}
                onResponse={(nextStatus) => handleInvitationResponse(invite.id, nextStatus)}
              />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Invitations