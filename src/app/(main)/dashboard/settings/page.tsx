import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import PageContainer from "@/components/layout/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { LoginSettingsForm } from "@/features/settings/components/login-settings-form";
import { settingsApiServer } from "@/features/settings/api/settings-api-server";

export const metadata = {
  title: "Dashboard: Settings",
};

type ProfilePayload = {
  name?: string;
  website?: string;
  logo?: string;
  email?: string;
  about?: string;
  locations?: { address?: string; googleMapLink?: string }[];
  phones?: string[];
};

export default async function SettingsPage() {
  let profileData: ProfilePayload = {};
  try {
    const res = await settingsApiServer.getProfile();
    if (res.success && res.data) {
      profileData = res.data as ProfilePayload;
    }
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to fetch profile data on server:", error);
  }

  const profileInitial = {
    name: profileData.name ?? "",
    email: profileData.email ?? "",
    website: profileData.website ?? "",
    logo: profileData.logo ?? "",
    about: profileData.about ?? "",
    locations:
      profileData.locations?.map((loc) => ({
        address: loc.address ?? "",
        googleMapLink: loc.googleMapLink ?? "",
      })) ?? [],
    phones: profileData.phones?.map((p) => ({ value: p ?? "" })) ?? [],
  };

  return (
    <PageContainer
      scrollable={true}
      pageTitle="Settings"
      pageDescription="Manage your business profile and account security."
    >
      <div className="space-y-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="login">Login & Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Suspense fallback={<div>Loading profile...</div>}>
              <ProfileForm initialData={profileInitial} />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="login">
            <Suspense fallback={<div>Loading login settings...</div>}>
              <LoginSettingsForm initialEmail={profileData.email ?? ""} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
