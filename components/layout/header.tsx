"use client";

import { useEffect, useState } from "react";
import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateBoardMenu } from "@/components/boards/create-board-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Invitation } from "../invitation/invitation";
import { InvitationWithDetails } from "@/types/invitation";
import { ThemeSwitcher } from "../theme-switcher";
// import { useBoardInvitationsRealtime } from "@/hooks/useBoardInvitationRealtime";


export function Header() {
  const [invitations, setInvitations] = useState<InvitationWithDetails[]>([]);
  const router = useRouter();
  
  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  useEffect(() => {
    fetch("/api/invitations")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInvitations(data);
      });
  }, []);

  useEffect(() => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any;

    const setupRealtime = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      channel = supabase
        .channel("board-invitations")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "board_invitations",
            filter: `invitee_email=eq.${user.email}`,
          },
          (payload) => {
            console.log("New invitation received (realtime)", payload);
            // setInvitations((prev) => [payload.new as InvitationWithDetails, ...prev]);
            fetch("/api/invitations")
              .then(res => res.json())
              .then(data => {
                if (Array.isArray(data)) setInvitations(data);
              });
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return (
    <header className="z-50 w-full border-b">
      <div className="flex h-12 items-center justify-between gap-2 px-3">
        {/* Left Section */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Link href="/">
            <Button
              variant="ghost"
              className="h-8 gap-2 px-2"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <rect x="2" y="2" width="8" height="8" rx="1" />
                <rect x="14" y="2" width="8" height="8" rx="1" />
                <rect x="2" y="14" width="8" height="8" rx="1" />
                <rect x="14" y="14" width="8" height="8" rx="1" />
              </svg>
              <span className="font-semibold">Trello</span>
            </Button>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="relative flex items-center gap-2 flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search"
            className="h-8 w-full pl-9 pr-4 text-sm"
          />
          <CreateBoardMenu>
            <Button
              variant="default"
              size="sm"
              className="h-8 px-3 text-sm font-medium"
            >
              Create
            </Button>
          </CreateBoardMenu>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">
          <ThemeSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="space-y-1 w-[450px] max-w-[450px] p-4 scrollbar-custom">
              {
                invitations.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) :
                  invitations.map((invite) => (
                    <Invitation key={invite.id} invitation={invite} />
                  ))
              }
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-semibold text-white">
                  QH
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px] p-2">
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                TRELLO
              </DropdownMenuLabel>
              {/* Account Section */}
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-xs font-semibold text-white">
                    QH
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Quốc Hội</span>
                  <span className="text-xs text-muted-foreground">quochoilam2207@gmail.com</span>
                </div>
              </div>

              <DropdownMenuGroup>
                <DropdownMenuItem>Switch accounts</DropdownMenuItem>
                <DropdownMenuItem>Manage account</DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              {/* Trello Section */}
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                TRELLO
              </DropdownMenuLabel>

              <DropdownMenuGroup>
                <DropdownMenuItem>Profile and visibility</DropdownMenuItem>
                <DropdownMenuItem>Activity</DropdownMenuItem>
                <DropdownMenuItem>Cards</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Theme</DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem>Create Workspace</DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuItem>Shortcuts</DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
