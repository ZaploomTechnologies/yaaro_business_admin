"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getImageUrl, cn } from "@/lib/utils";
import type { Offer } from "../types/offers";

export const offerColumns: ColumnDef<Offer>[] = [
  {
    accessorKey: "images",
    header: "Image",
    cell: ({ row }) => {
      const images = row.getValue("images") as string[];
      const url = images?.[0] || "";
      return (
        <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
          {url ? (
            <img
              src={getImageUrl(url)}
              alt="Offer"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
              No Image
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("title")}</span>
          {row.original.isPremium && (
            <Badge variant="default" className="w-fit scale-75 origin-left">
              Premium
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "rewardPoints",
    header: "Points",
    cell: ({ row }) => {
      const points = row.getValue("rewardPoints") as number;
      return <div className="font-medium">{points?.toLocaleString() || "0"}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ActionCell offer={row.original} />;
    },
  },
];

function ActionCell({ offer }: { offer: Offer }) {
  const id = offer.id || offer._id;

  if (!id) return null;

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/dashboard/offers/${id}/details`}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex h-8 items-center gap-2 px-3")}
      >
        <Eye className="h-4 w-4" />
        <span className="hidden sm:inline">Details</span>
      </Link>
    </div>
  );
}
