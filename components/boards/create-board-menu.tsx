"use client";

import * as React from "react";
import { X, ChevronLeft, LayoutDashboard, FileText } from "lucide-react";
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
import type { CreateBoardInput } from "@/actions/board-actions";

type MenuView = "main" | "create-board";

interface CreateBoardMenuProps {
  children: React.ReactNode;
}

export function CreateBoardMenu({ children }: CreateBoardMenuProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<MenuView>("main");
  const [boardTitle, setBoardTitle] = React.useState("");
  const [visibility, setVisibility] = React.useState<CreateBoardInput["visibility"]>("private");
  const [showError, setShowError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

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

    setIsLoading(true);

    // Gọi server action với useTransition
    fetch("/api/boards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: boardTitle,
        visibility,
      }),
    }).then((res) => res.json())
      .then((data) => {
        setOpen(false);
        router.push(`/boards/${data.data.id}`);
      })
      .catch((error) => {
        setShowError(true);
        setErrorMessage(error.error || "Failed to create board");
      })
      .finally(() => {
        setIsLoading(false);
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
      <PopoverContent className="w-[304px] p-0" align="start" side="bottom">
        {view === "main" ? (
          <div className="p-3">
            {/* Header */}
            {/* <div className="relative mb-3 flex items-center justify-center">
              <h3 className="text-center text-sm font-medium text-foreground">
                Create
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 h-6 w-6"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div> */}

            {/* Menu Options */}
            <div className="space-y-1">
              <button
                className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent"
                onClick={() => setView("create-board")}
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded bg-muted">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Create board</div>
                  <div className="text-xs text-muted-foreground">
                    A board is made up of cards ordered on lists. Use it to
                    manage projects, track information, or organize anything.
                  </div>
                </div>
              </button>

              <button
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
              </button>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                disabled={!boardTitle.trim() || isLoading}
              >
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
