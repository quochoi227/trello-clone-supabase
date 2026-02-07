"use client";

import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
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
        </div>

        {/* Center Section - Search */}
        <div className="relative flex items-center gap-2 flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search"
            className="h-8 w-full pl-9 pr-4 text-sm"
          />
          <Button
            variant="default"
            size="sm"
            className="h-8 px-3 text-sm font-medium"
          >
            Create
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1">

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Bell className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-semibold text-white">
              QH
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
