import PageContainer from "@/components/layout/page-container";
import { OffersForm } from "./offers-form";
import { offersApiServer } from "../api/offers-api-server";

interface OffersViewPageProps {
  offerId: string;
}

export default async function OffersViewPage({ offerId }: OffersViewPageProps) {
  let initialData = null;

  if (offerId !== "new") {
    try {
      const response = await offersApiServer.getById(offerId);
      initialData = response.data;
    } catch (error) {
      console.error("Failed to fetch offer:", error);
    }
  }

  return (
    <PageContainer
      scrollable
      pageTitle={offerId === "new" ? "Create Offer" : "Edit Offer"}
      pageDescription={offerId === "new" ? "Add a new offer to your brand." : `Edit the details of ${initialData?.name || "the offer"}.`}
    >
      <OffersForm initialData={initialData} />
    </PageContainer>
  );
}
