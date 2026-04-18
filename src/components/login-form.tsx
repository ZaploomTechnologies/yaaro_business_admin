"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100/api";
      const response = await axios.post(`${apiUrl}/business/login`, {
        username,
        password,
      });

      // The backend may return { token, brand } directly OR { success: true, data: { token, brand } }
      const res = response.data;
      const data = res.data || res;
      
      const token = data?.token;
      const brand = data?.brand;

      if (token && brand) {
        login(token, brand);
        // Set cookie for middleware
        document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Strict`;
        toast.success("Welcome back, " + brand.name);
        router.push("/dashboard");
      } else {
        toast.error("Login failed: Invalid response from server");
        console.error("Login response debug:", res);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("mx-auto flex w-full max-w-md flex-col gap-6 px-1", className)} {...props}>
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Business Admin</CardTitle>
          <CardDescription>Enter your username and password to manage your offers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="brand_username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field className="pt-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        Don&apos;t have an account? <Link href="/register">Register your business</Link>
      </div>
    </div>
  );
}
