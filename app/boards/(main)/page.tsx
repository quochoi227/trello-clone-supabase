import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function BoardsList() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-bold text-3xl">My Boards</h1>
      <p className="text-muted-foreground">
        Welcome back! Here you can manage your Trello boards.
      </p>
      {/* TODO: Add boards list here */}
    </div>
  );
}

export default function BoardsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12 p-8">
      <Suspense fallback={<div>Loading...</div>}>
        <BoardsList />
      </Suspense>
    </div>
  );
}
