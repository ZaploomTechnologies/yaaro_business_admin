import { Gift, LayoutDashboard, Plus, Star } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/layout/page-container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | Business Admin",
};

export default function Page() {
  return (
    <PageContainer scrollable pageTitle="Business Dashboard" pageDescription="Welcome to your business management portal.">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Manage your promotional rewards</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Brand Status</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Your brand is visible to users</p>
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
            <CardDescription>Monitor your brand's latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground py-8 text-center">
              No recent activity to show.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
