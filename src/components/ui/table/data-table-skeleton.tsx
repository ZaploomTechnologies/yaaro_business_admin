import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  filterCount?: number;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  filterCount = 0,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Filters skeleton */}
      {filterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: filterCount }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full min-[400px]:w-40" />
          ))}
        </div>
      )}

      {/* Mobile card skeletons */}
      <div className="space-y-3 md:hidden">
        {Array.from({ length: Math.min(rowCount, 6) }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
            {Array.from({ length: Math.min(columnCount, 4) }).map((_, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Table skeleton (desktop) */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-6 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="mx-auto h-10 w-32 sm:mx-0" />
        <Skeleton className="mx-auto h-10 w-full max-w-xs sm:mx-0 sm:w-64" />
      </div>
    </div>
  );
}

