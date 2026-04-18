"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, AlertCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { applyCodeApi, type ApplyCodeResult } from "../api/apply-code-api";

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString();
}

function ResultCard({ result }: { result: ApplyCodeResult }) {
  if (result.status === "redeemed") {
    return (
      <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle2 className="size-5" />
            <CardTitle className="text-base">Redeemed Successfully</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <span className="text-muted-foreground">Offer</span>
            <span className="font-medium">{result.reward?.title ?? "-"}</span>
            <span className="text-muted-foreground">Customer</span>
            <span className="font-medium">{result.user?.username ?? "-"}</span>
            <span className="text-muted-foreground">Points Spent</span>
            <span className="font-medium">{result.redemption?.rewardPointsSpent ?? "-"}</span>
            <span className="text-muted-foreground">Redeemed At</span>
            <span className="font-medium">{formatDate(result.redemption?.usedAt)}</span>
            {result.redemption?.expiresAt && (
              <>
                <span className="text-muted-foreground">Expires At</span>
                <span className="font-medium">{formatDate(result.redemption.expiresAt)}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.status === "already_used") {
    return (
      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="size-5" />
            <CardTitle className="text-base">Already Redeemed</CardTitle>
          </div>
          <CardDescription>
            {result.message || "This code was already used at a previous visit."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <span className="text-muted-foreground">Offer</span>
            <span className="font-medium">{result.reward?.title ?? "-"}</span>
            <span className="text-muted-foreground">Customer</span>
            <span className="font-medium">{result.user?.username ?? "-"}</span>
            <span className="text-muted-foreground">Previously Used At</span>
            <span className="font-medium">{formatDate(result.usedAt)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.status === "expired") {
    return (
      <Card className="border-red-400 bg-red-50 dark:bg-red-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <Clock className="size-5" />
            <CardTitle className="text-base">Code Expired</CardTitle>
          </div>
          <CardDescription>This offer has passed its expiry date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <span className="text-muted-foreground">Offer</span>
            <span className="font-medium">{result.reward?.title ?? "-"}</span>
            <span className="text-muted-foreground">Customer</span>
            <span className="font-medium">{result.user?.username ?? "-"}</span>
            <span className="text-muted-foreground">Expired At</span>
            <span className="font-medium">{formatDate(result.expiresAt)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.status === "claim_required" || result.status === "user_required") {
    return (
      <Card className="border-blue-400 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <AlertCircle className="size-5" />
            <CardTitle className="text-base">Action Required</CardTitle>
          </div>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            {result.message}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-red-400 bg-red-50 dark:bg-red-950/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <XCircle className="size-5" />
          <CardTitle className="text-base">Invalid Code</CardTitle>
        </div>
        <CardDescription>{result.message || "No matching redeem code was found."}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function ApplyCodeForm() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplyCodeResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await applyCodeApi.apply(code.trim());
      setResult(response.data);
      if (response.success) {
        toast.success("Code redeemed successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to apply code");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Enter redeem code (e.g. GET25 or aB3xYz1Q)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
          className="font-mono"
        />
        <Button type="submit" disabled={loading || !code.trim()}>
          {loading ? "Checking..." : "Apply"}
        </Button>
      </form>

      {result && (
        <div className="space-y-3">
          <ResultCard result={result} />
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5 w-full">
            <RotateCcw className="size-3.5" />
            Apply Another Code
          </Button>
        </div>
      )}
    </div>
  );
}
