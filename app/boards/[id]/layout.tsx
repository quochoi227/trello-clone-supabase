import { Header } from "@/components/layout/header";
import { BoardBar } from "./_components/board-bar";
import { Suspense } from "react";

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
        <Suspense fallback={<div>Loading board...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
