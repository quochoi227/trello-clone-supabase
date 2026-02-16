"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebounceFn } from "@/hooks/useDebounceFn";

// api endpoint: GET /api/boards?q=keyword
// response schema: { success: boolean, data: Board[] | null, error: string | null }

type BoardSuggestion = {
  id: string;
  title: string;
};

function BoardSearch() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<BoardSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
    
  const handleInputSearchChange = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    const searchValue = (event.target as HTMLInputElement)?.value.trim();
    if (!searchValue) {
      setSuggestions([]);
      setActiveIndex(-1);
      setIsLoading(false);
      return;
    }
    setIsOpen(true);
    setIsLoading(true);
    fetch(`/api/boards?q=${encodeURIComponent(searchValue)}`)
      .then((response) => response.json())
      .then((result) => {
          setSuggestions(result.data ?? []);
          setActiveIndex(-1);
        })
        .catch(() => {
          setSuggestions([]);
          setActiveIndex(-1);
        })
        .finally(() => setIsLoading(false));
  }, []);
  const debounceSearchBoard = useDebounceFn(handleInputSearchChange, 350);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectBoard = (boardId: string) => {
    setIsOpen(false);
    setActiveIndex(-1);
    router.push(`/boards/${boardId}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLoading || suggestions.length === 0) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      console.log("ArrowDown pressed, current activeIndex:", activeIndex);
      setIsOpen(true);
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (event.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        event.preventDefault();
        const selectedBoard = suggestions[activeIndex];
        handleSelectBoard(selectedBoard.id);
      }
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      <Input
        type="search"
        placeholder="Search"
        // value={query}
        // onFocus={() => setIsOpen(true)}
        onInput={debounceSearchBoard}
        onKeyDown={handleKeyDown}
        className="h-8 w-full pl-9 pr-4 text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none"
      />

      {isOpen ? (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((board, index) => (
              <button
                key={board.id}
                type="button"
                onClick={() => handleSelectBoard(board.id)}
                className={`w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent ${
                  activeIndex === index ? "bg-accent" : ""
                }`}
              >
                {board.title}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">No boards found</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default BoardSearch;