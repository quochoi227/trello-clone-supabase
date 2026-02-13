import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { Clock } from "lucide-react";
import { BoardCard } from "@/components/boards/board-card";
import { fetchUserBoards } from "@/actions/board-actions";
import { Card } from "@/components/ui/card";

function BoardsListSkeleton() {
  return (
    <div className="flex flex-col gap-8 pt-12">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 rounded bg-muted animate-pulse" />
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-24 w-full bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

async function BoardsList() {
  const supabase = await createClient();
  const { data: claimData, error: claimError } = await supabase.auth.getClaims();

  if (claimError || !claimData?.claims) {
    redirect("/auth/login");
  }

  const { data: boards, error } = await fetchUserBoards()

  if (error) {
    console.error("Error fetching boards:", error);
    return <div>Error loading boards.</div>;
  }

  return (
    <div className="flex flex-col gap-8 pt-12">
      {/* Recently viewed */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5" />
          <h2 className="font-semibold text-base">Recently viewed</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {boards?.map((board) => (
            <BoardCard
              key={board.id}
              id={board.id}
              title={board.title}
              // coverImage={board.coverImage}
              // backgroundColor={board.backgroundColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BoardsPage() {
  return (
    <div className="w-full max-w-[912px] mx-auto">
      <Suspense fallback={<BoardsListSkeleton />}>
        <BoardsList />
      </Suspense>
    </div>
  );
}
