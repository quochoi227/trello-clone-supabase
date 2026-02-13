"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";

interface BoardCardProps {
  id: string;
  title: string;
  coverImage?: string;
  backgroundColor?: string;
}

export function BoardCard({
  id,
  title,
  coverImage,
  backgroundColor
}: BoardCardProps) {
  const isGradient = backgroundColor?.startsWith("linear-gradient");
  
  return (
    <Link href={`/boards/${id}`}>
      <Card className="group overflow-hidden cursor-pointer h-full shadow-[0px_1px_1px_#1E1F2140,_0px_0px_1px_#1E1F214F]">
        <div
          className="h-24 w-full bg-cover bg-center relative bg-muted-foreground"
          style={{
            backgroundImage: coverImage
              ? `url(${coverImage})`
              : isGradient
              ? backgroundColor
              : undefined,
            backgroundColor: !coverImage && !isGradient ? backgroundColor : undefined,
          }}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-2">{title}</h3>
        </div>
      </Card>
    </Link>
  );
}
