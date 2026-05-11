"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { IconArrowLeft, IconCheck, IconEye, IconEyeOff } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [contactError, setContactError] = useState("");

  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post<any>("/business/public/uploadImage", formData);
    if (response.success && response.data?.url) {
      return response.data.url;
    }
    throw new Error(response.message || "Upload failed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPhoneError("");
    setContactError("");

    if (!email && !phone) {
      setContactError("Please enter at least one of email or phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post<any>("/business/register", {
        name,
        email,
        phone,
        password,
        logo,
      });

      if (response.success && response.data?.token) {
        const { token, brand } = response.data;
        login(token, brand);
        document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
        toast.success("Welcome, " + brand.name + "! Your account has been created.");
        router.push("/dashboard");
      } else {
        toast.error("Registration failed: Invalid response from server");
      }
    } catch (error: any) {
      const msg: string = error.message || "";
      if (msg === "Email already registered") {
        setEmailError("This email is already registered.");
      } else if (msg === "Phone number already registered") {
        setPhoneError("This phone number is already registered.");
      } else {
        toast.error(msg || "Registration failed. Please try again.");
      }
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
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    aria-invalid={!!phoneError}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError("");
                      setContactError("");
                    }}
                  />
                  {phoneError && <FieldError>{phoneError}</FieldError>}
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    aria-invalid={!!emailError || !!contactError}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                      setContactError("");
                    }}
                  />
                  {emailError && <FieldError>{emailError}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </div>

              {contactError && (
                <p className="text-destructive text-sm -mt-4">{contactError}</p>
              )}

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
