"use client";

import * as React from "react";
import { useRef } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { IconSearch, IconX } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { useDebounce } from "@/hooks/use-debounce";

import { DataTable as DataTableComponent } from "./data-table";
import { MobileDataCards } from "./mobile-data-cards";

interface ServerDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  totalRows: number;
  pageSizeOptions?: number[];
}

export function ServerDataTable<TData extends { id?: string; _id?: string; deletedAt?: string | Date | null }>({
  columns,
  data,
  totalRows,
  pageSizeOptions = [10, 20, 30, 50],
}: ServerDataTableProps<TData>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = React.useState(searchParams.get("search") || "");
  const [isLoading, setIsLoading] = React.useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Debounce search input with 500ms delay
  const debouncedSearch = useDebounce(search, 500);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const table = useDataTableInstance({
    data: data || [],
    columns,
    defaultPageIndex: 0, // Always 0 for server-side pagination since data is already paginated
    defaultPageSize: limit,
    getRowId: (row) => (row as any).id || (row as any)._id || "",
  });

  // Handle debounced search - update URL when debounced value changes
  React.useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (debouncedSearch !== currentSearch) {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
        params.set("page", "1");
      } else {
        params.delete("search");
        params.set("page", "1");
      }
      const newUrl = `?${params.toString()}`;
      router.push(newUrl);
    }
  }, [debouncedSearch, router, searchParams]);

  // Reset loading state when data changes
  React.useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSearchChange = React.useCallback(
    (value: string) => {
      setSearch(value);
      // Show loading immediately when user types
      if (value !== (searchParams.get("search") || "")) {
        setIsLoading(true);
      }
    },
    [searchParams],
  );

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(newPage + 1));
      const newUrl = `?${params.toString()}`;
      router.push(newUrl);
    },
    [router, searchParams],
  );

  const handlePageSizeChange = React.useCallback(
    (newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", String(newPageSize));
      params.set("page", "1");
      const newUrl = `?${params.toString()}`;
      router.push(newUrl);
    },
    [router, searchParams],
  );

  // Update table state when URL params or data change
  // Note: Since we're doing server-side pagination, the data array already contains
  // only the records for the current page. So we always set pageIndex to 0
  // to show the first (and only) page of the server-paginated data.
  React.useEffect(() => {
    const currentPageSize = table.getState().pagination.pageSize;

    // For server-side pagination, always show page 0 of the current dataset
    // The server has already paginated the data, so we just display what we have
    table.setPageIndex(0);
    if (currentPageSize !== limit) {
      table.setPageSize(limit);
    }
    searchInputRef.current?.focus();
  }, [limit, table]);

  const totalPages = Math.ceil(totalRows / limit);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search */}
      <div className="flex w-full items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <IconSearch className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="cursor-pointer pl-9"
            ref={searchInputRef}
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="-translate-y-1/2 absolute top-1/2 right-1 h-7 w-7 p-0"
              onClick={() => handleSearchChange("")}
            >
              <IconX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table with Skeleton Loading */}
      {isLoading ? (
        <DataTableSkeleton columnCount={columns.length} rowCount={limit} />
      ) : (
        <>
          <MobileDataCards
            table={table}
            getRowClassName={(row: TData) => {
              if (row.deletedAt) return "bg-muted/40 opacity-80";
              return "";
            }}
          />
          <div className="hidden overflow-x-auto rounded-md border md:block">
            <DataTableComponent
              table={table}
              columns={columns}
              getRowClassName={(row: TData) => {
                if (row.deletedAt) {
                  return "bg-muted/50 opacity-60";
                }
                return "";
              }}
            />
          </div>
        </>
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-3 px-0 sm:px-2 md:flex-row md:items-center md:justify-between md:px-4">
        <div className="text-center text-muted-foreground text-xs sm:text-left sm:text-sm">
          {totalRows} row(s) total
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:w-auto lg:gap-8">
          <div className="flex items-center justify-center gap-2">
            <label htmlFor="rows-per-page" className="shrink-0 font-medium text-xs sm:text-sm">
              Per page
            </label>
            <select
              id="rows-per-page"
              value={limit}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center font-medium text-sm">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 sm:flex"
              onClick={() => handlePageChange(0)}
              disabled={page === 1}
            >
              <span className="sr-only">Go to first page</span>«
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(page - 2)}
              disabled={page === 1}
            >
              <span className="sr-only">Go to previous page</span>‹
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(page)}
              disabled={page >= totalPages}
            >
              <span className="sr-only">Go to next page</span>›
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 sm:flex"
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={page >= totalPages}
            >
              <span className="sr-only">Go to last page</span>»
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
