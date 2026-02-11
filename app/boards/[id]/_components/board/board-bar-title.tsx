"use client"

import { useBoardStore } from "@/stores/board-store"

export function BoardBarTitle() {
  const { currentActiveBoard } = useBoardStore()

  return <h1 className="text-md font-semibold">{currentActiveBoard?.title}</h1>
}