export interface Category {
  _id: string;
  name: string;
}

export interface Offer {
  id?: string; // Backend transforms _id to id via removeVFromSchema helper
  _id?: string; // Fallback for compatibility
  title: string;
  description: string;
  images: string[];
  brandId?: string;
  categoryId: string | Category;
  isPremium: boolean;
  redeemUrl?: string;
  redeemCode?: string;
  rewardPoints: number;
  redeemedExpiry: number;
  howToRedeemSteps?: string;
  termsCondition?: string;
  termsConditionUrl?: string;
  isTrending: boolean;
  isFeatured: boolean;
  offerType: "upto" | "discount" | "flat";
  whereToRedeem?: "online" | "offline";
  minPrice: number;
  maxPrice: number;
  discountPercentage: number;
  redemptionCount?: number;
  usedCount?: number;
  expiredCount?: number;
  pendingCount?: number;
  status?: "active" | "inactive";
  createdAt?: string;

  updatedAt?: string;
  deletedAt?: string | null;
}

export interface OffersResponse {
  success: boolean;
  data: Offer[];
  total: number;
}
