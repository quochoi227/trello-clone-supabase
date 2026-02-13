import { Header } from "@/components/layout/header";
import { BoardBar } from "./_components/board/board-bar";
import { Suspense } from "react";
import { BoardColumnsSkeleton } from "./_components/board/board-columns-skeleton";

export default function BoardDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <BoardBar />
      <main className="flex-1 overflow-x-auto scrollbar-custom">
        <Suspense fallback={<BoardColumnsSkeleton />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
