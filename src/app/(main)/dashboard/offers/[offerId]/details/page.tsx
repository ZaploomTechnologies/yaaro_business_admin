import { offersApiServer } from "@/features/offers/api/offers-api-server";
import OfferDetailsView from "@/features/offers/components/offer-details-view";
import PageContainer from "@/components/layout/page-container";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Dashboard: Offer Details",
};

interface PageProps {
  params: Promise<{ offerId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { offerId } = await params;
  
  try {
    const response = await offersApiServer.getById(offerId);
    if (!response.success || !response.data) {
      return notFound();
    }

    return (
      <PageContainer scrollable pageTitle="Offer Details" pageDescription="View detailed information and statistics for this offer.">
        <OfferDetailsView offer={response.data} />
      </PageContainer>
    );
  } catch (error) {
    console.error("Failed to fetch offer details:", error);
    return notFound();
  }
}
