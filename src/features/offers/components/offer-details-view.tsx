"use client";

import { Offer } from "../types/offers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getImageUrl } from "@/lib/utils";
import { CheckCircle2, Clock, Globe, MapPin, Tag, Ticket, Users } from "lucide-react";

interface OfferDetailsViewProps {
  offer: Offer;
}

export default function OfferDetailsView({ offer }: OfferDetailsViewProps) {
  const stats = [
    {
      title: "Total Claims",
      value: offer.redemptionCount || 0,
      description: "Users who got this offer",
      icon: Ticket,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Successfully Used",
      value: offer.usedCount || 0,
      description: "Rewards redeemed by users",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Expired Claims",
      value: offer.expiredCount || 0,
      description: "Claimed but never used",
      icon: Clock,
      color: "text-red-600",
      bg: "bg-red-50"
    },
    ...(offer.whereToRedeem !== "online" ? [{
      title: "Pending Usage",
      value: offer.pendingCount || 0,
      description: "Claimed and awaiting use",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    }] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className={`grid grid-cols-2 gap-4 ${stats.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md">
            <div className={`h-1 ${stat.color.replace('text', 'bg')}`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              </div>
              <div className={`rounded-full p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Basic Information</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {offer.isPremium && <Badge variant="default">Premium</Badge>}
                  {offer.isFeatured && <Badge variant="secondary">Featured</Badge>}
                  {offer.isTrending && <Badge variant="outline">Trending</Badge>}
                </div>
              </div>
              <CardDescription>Main details and description of the reward offer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-1">Title</h4>
                <p className="text-lg font-medium">{offer.title}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-1">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{offer.description}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Offer Type</h4>
                  <Badge variant="secondary" className="capitalize">{offer.offerType}</Badge>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">Reward Points</h4>
                  <p className="text-lg font-bold text-primary">{offer.rewardPoints.toLocaleString()} pts</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Where to Redeem</h4>
                  <div className="flex items-center gap-1 text-sm">
                    {offer.whereToRedeem === "online" ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    <span className="capitalize">{offer.whereToRedeem || "Offline"}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Expiry Window</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{offer.redeemedExpiry} days after redemption</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Content & Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {offer.termsCondition && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-destructive" /> Terms & Conditions
                  </h4>
                  <div 
                    className="text-sm text-muted-foreground ml-2 prose prose-sm max-w-none
                    [&>ul]:list-disc [&>ul]:list-inside [&>ul]:space-y-1"
                    dangerouslySetInnerHTML={{ __html: offer.termsCondition }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Media & Specifics */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Offer Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {offer.images && offer.images.length > 0 ? (
                  offer.images.map((img, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                      <img src={getImageUrl(img)} alt={`Offer ${i+1}`} className="object-cover w-full h-full" />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    <p className="text-sm italic">No images provided</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Redemption Logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {offer.redeemCode && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Preset Code</h4>
                  <div className="p-2 bg-secondary rounded font-mono text-center border">
                    {offer.redeemCode}
                  </div>
                </div>
              )}
              {offer.redeemUrl && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Redirect URL</h4>
                  <a href={offer.redeemUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                    {offer.redeemUrl}
                  </a>
                </div>
              )}
              {offer.termsConditionUrl && (
                <div>
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Full Terms Link</h4>
                  <a href={offer.termsConditionUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                    View external terms
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
