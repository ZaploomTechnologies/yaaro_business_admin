import { Gift, Plus, Star, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/layout/page-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { offersApiServer } from "@/features/offers/api/offers-api-server";
import { serverApiClient } from "@/lib/api-client-server";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Dashboard | Business Admin",
};

async function getDashboardData() {
  try {
    const [offersRes, profileRes] = await Promise.allSettled([
      offersApiServer.getAll({ limit: 10, sortBy: "createdAt", sortOrder: "desc" }),
      serverApiClient.get<any>("/business/profile"),
    ]);

    const offers = offersRes.status === "fulfilled" ? offersRes.value : { data: [], total: 0 };
    const profile = profileRes.status === "fulfilled" ? profileRes.value : { data: null };

    const activeOffers = offers.data?.filter((o: any) => o.status !== "inactive") ?? [];

    return {
      totalOffers: offers.total ?? offers.data?.length ?? 0,
      activeOffersCount: activeOffers.length,
      recentOffers: (offers.data ?? []).slice(0, 5),
      brandStatus: profile.data?.status ?? "active",
      brandName: profile.data?.name ?? "",
    };
  } catch {
    return { totalOffers: 0, activeOffersCount: 0, recentOffers: [], brandStatus: "active", brandName: "" };
  }
}

export default async function Page() {
  const { totalOffers, activeOffersCount, recentOffers, brandStatus } = await getDashboardData();

  const isActive = brandStatus === "active";

  return (
    <PageContainer scrollable pageTitle="Business Dashboard" pageDescription="Welcome to your business management portal.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOffersCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalOffers} total offer{totalOffers !== 1 ? "s" : ""} created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Status</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isActive ? "text-green-600" : "text-red-500"}`}>
              {isActive ? "Active" : "Inactive"}
            </div>
            <p className="text-xs text-muted-foreground">
              {isActive ? "Your brand is visible to users" : "Your brand is hidden from users"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOffers}</div>
            <p className="text-xs text-muted-foreground">All time offers created</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Commonly used business operations</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild className="h-24 w-40 flex-col gap-2">
              <Link href="/dashboard/offers/new">
                <Plus className="h-6 w-6" />
                <span>New Offer</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 w-40 flex-col gap-2">
              <Link href="/dashboard/offers">
                <Gift className="h-6 w-6" />
                <span>My Offers</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest offers</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOffers.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No activity yet. Create your first offer!
              </div>
            ) : (
              <ul className="space-y-3">
                {recentOffers.map((offer: any) => (
                  <li key={offer._id ?? offer.id} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <Gift className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/offers/${offer._id ?? offer.id}`}
                          className="text-sm font-medium hover:underline truncate block"
                        >
                          {offer.title}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {offer.createdAt
                              ? formatDistanceToNow(new Date(offer.createdAt), { addSuffix: true })
                              : "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={offer.status === "inactive" ? "secondary" : "default"}
                      className="shrink-0 text-xs"
                    >
                      {offer.status === "inactive" ? "Inactive" : "Active"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
