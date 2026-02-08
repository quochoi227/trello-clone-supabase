"use client";

import * as React from "react";
import { X, ChevronLeft, UserPlus, Info, Users, Share2, Star, Settings, Zap, Rocket, Tag, Sticker, Activity, Archive, Eye, Copy, Mail, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBoard } from "@/actions/board-actions";
import type { CreateBoardInput } from "@/actions/board-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type MenuView = "main" | "create-board";

interface CreateBoardMenuProps {
  children: React.ReactNode;
}

export function BoardOptions({ children }: CreateBoardMenuProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<MenuView>("main");
  const [boardTitle, setBoardTitle] = React.useState("");
  const [visibility, setVisibility] = React.useState<CreateBoardInput["visibility"]>("private");
  const [showError, setShowError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset về menu chính khi đóng
      setTimeout(() => {
        setView("main");
        setBoardTitle("");
        setShowError(false);
        setErrorMessage("");
        setVisibility("private");
      }, 200);
    }
  };

  const handleCreateBoard = () => {
    if (!boardTitle.trim()) {
      setShowError(true);
      setErrorMessage("Board title is required");
      return;
    }

    // Gọi server action với useTransition
    startTransition(async () => {
      const result = await createBoard({
        title: boardTitle,
        visibility,
      });

      if (result.success) {
        // Đóng popover và reset form
        setOpen(false);
        // Redirect đến board mới tạo (optional)
        if (result.data?.id) {
          router.push(`/boards/${result.data.id}`);
        }
      } else {
        // Hiển thị lỗi
        setShowError(true);
        setErrorMessage(result.error || "Failed to create board");
      }
    });
  };

  const handleBack = () => {
    setView("main");
    setBoardTitle("");
    setShowError(false);
    setErrorMessage("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="start" side="left">
        {view === "main" ? (
          <div className="p-3 pr-1.5">
            {/* Header */}
            <div className="relative mb-3 flex items-center justify-center">
              <h3 className="text-center text-sm font-medium text-foreground">
                Menu
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 h-6 w-6"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Menu Options */}
            <div className="space-y-1 max-h-[560px] overflow-y-auto pr-1.5 scrollbar-custom">
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 justify-start">
                  <UserPlus />
                  Share
                </Button>
                <Avatar>
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                    className="grayscale"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
              <Separator />
              <button
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left transition-colors hover:bg-accent"
                onClick={() => setView("create-board")}
              >
                <Info size={16} />
                <div className="flex-1">
                  <div className="text-sm font-medium">About this board</div>
                  <div className="text-xs text-muted-foreground">
                    Add a description to your board
                  </div>
                </div>
              </button>
              <Button variant="ghost" className="w-full justify-start">
                <Users size={16} />
                Visibility: Private
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Share2 size={16} />
                Print, export and share
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Star size={16} />
                Star
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-start">
                <Settings size={16} />
                Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <span className="h-5 w-5 bg-slate-500 rounded-sm"></span>
                Change background
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-start">
                <Zap size={16} />
                Automation
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Rocket size={16} />
                Power-Ups
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Tag size={16} />
                Labels
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Sticker size={16} />
                Stickers
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Activity size={16} />
                Activity
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Archive size={16} />
                Archived items
              </Button>
              <Separator />
              <Button variant="ghost" className="w-full justify-start">
                <Eye size={16} />
                Watch
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Copy size={16} />
                Copy board
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Mail size={16} />
                Email-to-board
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Minus size={16} />
                Close board
              </Button>

              {/* <button
                className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent"
                disabled
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded bg-muted">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 opacity-50">
                  <div className="text-sm font-medium">Start with a template</div>
                  <div className="text-xs text-muted-foreground">
                    Get started faster with a board template.
                  </div>
                </div>
              </button> */}
            </div>
          </div>
        ) : (
          <div className="p-3">
            {/* Header with back button */}
            <div className="relative mb-4 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 h-6 w-6"
                onClick={handleBack}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-center text-sm font-medium text-foreground">
                Create board
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 h-6 w-6"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Create Board Form */}
            <div className="space-y-4">
              {/* Board Title */}
              <div className="space-y-2">
                <Label htmlFor="board-title" className="text-xs font-bold">
                  Board title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="board-title"
                  value={boardTitle}
                  onChange={(e) => {
                    setBoardTitle(e.target.value);
                    if (showError && e.target.value.trim()) {
                      setShowError(false);
                      setErrorMessage("");
                    }
                  }}
                  className={`h-9 ${
                    showError && errorMessage
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  placeholder=""
                  disabled={isPending}
                />
                {showError && errorMessage && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <span className="text-base">👋</span>
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label htmlFor="visibility" className="text-xs font-bold">
                  Visibility
                </Label>
                <Select 
                  value={visibility} 
                  onValueChange={(value) => setVisibility(value as CreateBoardInput["visibility"])} 
                  disabled={isPending}
                >
                  <SelectTrigger id="visibility" className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="workspace">Workspace</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Create Button */}
              <Button
                className="w-full"
                onClick={handleCreateBoard}
                disabled={!boardTitle.trim() || isPending}
              >
                {isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
