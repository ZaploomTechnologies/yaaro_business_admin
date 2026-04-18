import { apiClient } from "@/lib/api-client";

export type RedeemStatus = "redeemed" | "already_used" | "expired" | "not_found" | "claim_required" | "user_required";

export interface RedeemUser {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
}

export interface RedeemReward {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  rewardPoints?: number;
}

export interface ApplyCodeResult {
  status: RedeemStatus;
  message?: string;
  redemption?: {
    id: string;
    redeemCode: string;
    rewardPointsSpent: number;
    usedAt: string;
    expiresAt?: string;
    createdAt: string;
  };
  user?: RedeemUser;
  reward?: RedeemReward;
  usedAt?: string;
  expiresAt?: string;
}

export const applyCodeApi = {
  apply: async (redeemCode: string): Promise<{ success: boolean; data: ApplyCodeResult; message?: string }> => {
    const response = await apiClient.post<ApplyCodeResult>("/business/apply-code", {
      redeemCode,
    });
    return response as { success: boolean; data: ApplyCodeResult; message?: string };
  },
};
