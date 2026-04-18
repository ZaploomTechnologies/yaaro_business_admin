import { ServerDataTable } from "@/components/data-table/server-data-table";
import { searchParamsCache } from "@/lib/searchparams";
import { offersApiServer } from "../api/offers-api-server";
import { offerColumns } from "./offers-columns";

export default async function OffersListingPage() {
  const searchParams = searchParamsCache.all();

  const data = await offersApiServer.getAll({
    page: searchParams.page,
    limit: searchParams.limit,
    search: searchParams.search,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
  });

  return (
    <ServerDataTable
      columns={offerColumns}
      data={data.data}
      totalRows={data.total}
      pageSizeOptions={[10, 20, 30, 50]}
    />
  );
}
