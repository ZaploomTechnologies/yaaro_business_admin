import { Suspense } from "react";
import PageContainer from "@/components/layout/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { LoginSettingsForm } from "@/features/settings/components/login-settings-form";
import { settingsApiServer } from "@/features/settings/api/settings-api-server";

export const metadata = {
  title: "Dashboard: Settings",
};

export default async function SettingsPage() {
  // We can fetch the initial profile data on the server
  let profileData = { name: "", website: "", logo: "", username: "" };
  try {
    const res = await settingsApiServer.getProfile();
    if (res.success) {
      profileData = res.data;
    }
  } catch (error) {
    console.error("Failed to fetch profile data on server:", error);
  }

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
              <ProfileForm 
                initialData={{
                  name: profileData.name || "",
                  website: profileData.website || "",
                  logo: profileData.logo || "",
                }} 
              />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="login">
            <Suspense fallback={<div>Loading login settings...</div>}>
              <LoginSettingsForm initialUsername={profileData.username || ""} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
