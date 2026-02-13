import { Skeleton } from "@/components/ui/skeleton";

function ColumnSkeleton({ cardCount = 4 }: { cardCount?: number }) {
  return (
    <div className="w-[272px] min-w-[272px] rounded-2xl bg-[#f1f2f4] p-2 dark:bg-slate-800">
      <div className="flex h-[40px] items-center justify-between gap-2 pb-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      <div className="space-y-2">
        {Array.from({ length: cardCount }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-card p-3">
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="mt-2 h-4 w-[55%]" />
          </div>
        ))}
      </div>

      <div className="pt-3">
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export function BoardColumnsSkeleton() {
  return (
    <div className="h-full p-3 pb-2">
      <div className="flex h-full items-start gap-4 overflow-x-auto pb-4 scrollbar-custom">
        <ColumnSkeleton cardCount={4} />
        <ColumnSkeleton cardCount={3} />
        <ColumnSkeleton cardCount={5} />

        <div className="w-60 min-w-60 h-fit">
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
