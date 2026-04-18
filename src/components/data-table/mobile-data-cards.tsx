"use client";

import type { Cell, Table as TanStackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function getCellLabel<TData>(cell: Cell<TData, unknown>): string {
  const def = cell.column.columnDef;
  if (typeof def.header === "string") return def.header;
  const meta = def.meta as { label?: string } | undefined;
  if (meta?.label) return meta.label;
  const accessorKey = "accessorKey" in def ? def.accessorKey : undefined;
  if (typeof accessorKey === "string") {
    const key = String(accessorKey);
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }
  if (cell.column.id === "actions") return "Actions";
  return cell.column.id;
}

interface MobileDataCardsProps<TData> {
  table: TanStackTable<TData>;
  getRowClassName?: (row: TData) => string;
}

export function MobileDataCards<TData>({ table, getRowClassName }: MobileDataCardsProps<TData>) {
  const rows = table.getRowModel().rows;

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-muted-foreground text-sm md:hidden">
        No results.
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row) => {
        const rowClass = getRowClassName?.(row.original) ?? "";
        const cells = row.getVisibleCells();
        const dataCells = cells.filter((c) => c.column.id !== "actions");
        const actionCell = cells.find((c) => c.column.id === "actions");

        return (
          <Card key={row.id} className={cn("overflow-hidden border bg-card shadow-sm", rowClass)}>
            <CardContent className="space-y-3 p-4">
              {dataCells.map((cell) => (
                <div
                  key={cell.id}
                  className="space-y-1.5 border-border/50 border-b pb-3 last:mb-0 last:border-0 last:pb-0"
                >
                  <p className="font-semibold text-[11px] text-muted-foreground uppercase tracking-wide">
                    {getCellLabel(cell)}
                  </p>
                  <div className="min-w-0 break-words text-sm leading-relaxed [&_.text-muted-foreground]:text-xs">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </div>
              ))}
              {actionCell && (
                <div className="flex justify-end border-border/60 border-t pt-3">
                  {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
