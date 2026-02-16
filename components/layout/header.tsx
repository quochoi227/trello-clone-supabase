"use client";

import { HelpCircle, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ThemeSwitcher } from "../theme-switcher";
import Invitations from "../invitations/invitations";
import { useEffect, useState } from "react";
import { AuthSession } from "@supabase/supabase-js";
import BoardSearch from "../board-search";
// import { useBoardInvitationsRealtime } from "@/hooks/useBoardInvitationRealtime";

export function Header() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const fetchSession = async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  }

  useEffect(() => {
    fetchSession()

    const {data: { subscription }} = createClient().auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    }
  }, [])

  return (
    <header className="z-50 w-full border-b">
      <div className="flex h-12 items-center justify-between gap-2 px-3">
        {/* Left Section */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="h-8 gap-2 px-2"
            size="icon"
          >
            <LayoutGrid />
          </Button>

          <Link href="/">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted transition-colors">
              <svg fill="#fff" width="26px" height="26px" viewBox="-100 -100 1200.00 1200.00" xmlns="http://www.w3.org/2000/svg" stroke="#fff" strokeWidth="0.01"><g id="SVGRepo_bgCarrier" strokeWidth="0" transform="translate(0,0), scale(1)"><rect x="-100" y="-100" width="1200.00" height="1200.00" rx="240" fill="#1f5ca9" strokeWidth="0"></rect></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M331 650q88 54 170 61v-53q-30 4-60 4-55 0-110-12zm326 22q48-36 56-99-27 19-56 34v65zM500 70q-117 0-217 59-97 57-154 154-59 100-59 217t59 217q57 97 154 154 100 59 217 59t217-59q97-57 154-154 59-100 59-217t-59-217q-57-97-154-154-100-59-217-59zm59 278l153-88q8-4 17-2t13.5 10.5T745 286t-11 14l-68 39q21 11 30 32.5t1.5 43.5-27 34-42.5 8.5-38.5-21.5-15.5-41l1-5q-9 2-16-2t-10-12 0-15.5 10-12.5zm-302-79q5-9 14-11t17 2l153 88q7 5 10 13.5t-1 16.5-12.5 11-16.5 0v6q0 23-15 41t-38.5 21.5T324 448t-26.5-35.5 3-43.5 31.5-31l-67-39q-8-4-10-13t2-17zm338 470q-34 8-70 8-71 0-146-32-54-24-105-61-27-20-43-36l19-28q26 10 60 19 68 18 131 18 32 0 62-5 82-12 157-56 37-23 58-43l30 10q1 9 0 27-1 32-12 61-14 40-44 68-37 35-97 50zm-6-35q24-6 46-17v-69q-22 11-46 19v67zm-66 8h2q21 0 41-3v-65q-22 6-43 10v58z"></path></g></svg>
              {/* <Trello /> */}
              <span className="font-semibold">Fellow</span>
            </div>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <BoardSearch />
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

          <Invitations />

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
                <AvatarImage src={session?.user?.user_metadata?.avatar_url} alt="User" />
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
                  <AvatarImage src={session?.user?.user_metadata?.avatar_url} alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-xs font-semibold text-white">
                    QH
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{session?.user?.user_metadata?.full_name}</span>
                  <span className="text-xs text-muted-foreground">{session?.user?.user_metadata?.email}</span>
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
