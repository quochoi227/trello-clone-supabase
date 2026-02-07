import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  Rocket,
  Zap,
  Menu,
  Star,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { mockData } from "@/apis/mock-data";

interface BoardBarProps {
  title?: string;
}

export function BoardBar({ title }: BoardBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b">
      {/* Left side */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">{title || mockData.board.title}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>Board settings</DropdownMenuItem>
            <DropdownMenuItem>Change visibility</DropdownMenuItem>
            <DropdownMenuItem>Archive board</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        {/* Avatar with online indicator */}
        <div className="relative mr-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="text-xs">U</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Icon buttons */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Rocket className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Zap className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Menu className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Star className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Users className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Share button */}
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Users className="h-4 w-4" />
          <span>Share</span>
        </Button>

        {/* More button */}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
