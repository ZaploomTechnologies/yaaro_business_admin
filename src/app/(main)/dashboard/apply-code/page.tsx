import PageContainer from "@/components/layout/page-container";
import { ApplyCodeForm } from "@/features/apply-code/components/apply-code-form";

export const metadata = {
  title: "Dashboard: Apply Code",
};

export default function ApplyCodePage() {
  return (
    <PageContainer
      scrollable={true}
      pageTitle="Apply Code"
      pageDescription="Enter a customer's redeem code to verify and confirm their reward at your store."
    >
      <ApplyCodeForm />
    </PageContainer>
  );
}
