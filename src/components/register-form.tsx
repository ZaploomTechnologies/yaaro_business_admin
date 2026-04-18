"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    
    // Using the PUBLIC upload endpoint for registration
    const response = await apiClient.post<any>("/business/public/uploadImage", formData);
    
    if (response.success && response.data?.url) {
      return response.data.url;
    }
    throw new Error(response.message || "Upload failed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post<any>("/business/register", {
        name,
        username,
        password,
        website,
        logo,
      });

      if (response.success && response.data?.token) {
        const { token, brand } = response.data;
        login(token, brand);
        // Set cookie for middleware
        document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
        
        toast.success("Welcome, " + brand.name + "! Your account has been created.");
        router.push("/dashboard");
      } else {
        toast.error("Registration failed: Invalid response from server");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-1">
      <Card className="border shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight">Register Business</CardTitle>
          <CardDescription>Join our platform and start managing your offers today.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center justify-center pb-2">
              <ImageUploader
                label="Business Logo"
                value={logo}
                onChange={setLogo}
                onUpload={handleUpload}
                className="w-full"
              />
            </div>
            
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name">Business Name</FieldLabel>
                  <Input
                    id="name"
                    placeholder="Enter your business name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="website">Website (Optional)</FieldLabel>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    placeholder="choose_a_username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
              </div>

              <Button type="submit" className="w-full mt-4 h-11 text-base" disabled={loading}>
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 h-5 w-5" />
                    Register Business
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t py-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
      
      <div className="flex justify-center">
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
