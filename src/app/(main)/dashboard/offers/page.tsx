import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { SearchParams } from "nuqs/server";

import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import OffersListingPage from "@/features/offers/components/offers-listing";
import { searchParamsCache } from "@/lib/searchparams";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Dashboard: My Offers",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);
  const parsedParams = searchParamsCache.all();

  return (
    <PageContainer
      scrollable={false}
      pageTitle="Offers"
      pageDescription="Manage your brand's rewards and promotional offers."
      pageHeaderAction={
        <Link href="/dashboard/offers/new" className={cn(buttonVariants(), "text-xs md:text-sm")}>
          <Plus className="mr-2 h-4 w-4" /> Add New Offer
        </Link>
      }
    >
      <Suspense
        key={`${parsedParams.page}-${parsedParams.limit}-${parsedParams.search || ""}`}
        fallback={<DataTableSkeleton columnCount={5} rowCount={8} />}
      >
        <OffersListingPage />
      </Suspense>
    </PageContainer>
  );
}
