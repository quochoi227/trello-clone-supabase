import { Header } from "@/components/layout/header";
import { BoardBar } from "./_components/board-bar";

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
        {children}
      </main>
    </div>
  );
}
