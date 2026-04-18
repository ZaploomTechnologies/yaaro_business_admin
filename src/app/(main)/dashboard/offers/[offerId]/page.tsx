import OffersViewPage from "@/features/offers/components/offers-view-page";

export const metadata = {
  title: "Dashboard: Edit Offer",
};

interface PageProps {
  params: Promise<{ offerId: string }>;
}

export default async function Page({ params }: PageProps) {
  const { offerId } = await params;
  return <OffersViewPage offerId={offerId} />;
}
