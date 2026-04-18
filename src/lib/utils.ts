import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create a URL-safe slug from a human-readable name (lowercase, hyphens).
 * Users can still edit the slug separately in forms; this is the default suggestion.
 */
export function slugifyFromName(name: string): string {
  if (!name || typeof name !== "string") return "";
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export const getInitials = (str: string): string => {
  if (typeof str !== "string" || !str.trim()) return "?";

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
};

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  },
) {
  const { currency = "USD", locale = "en-US", minimumFractionDigits, maximumFractionDigits, noDecimals } = opts ?? {};

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}

/**
 * Get full image URL by prefixing with NEXT_PUBLIC_IMAGE_URL if URL doesn't start with http/https
 * @param url - Image URL (can be relative or absolute)
 * @returns Full image URL
 */
export function getImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  // If URL already starts with http:// or https://, return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Otherwise, prefix with NEXT_PUBLIC_IMAGE_URL
  const imageBaseUrl = process.env.NEXT_PUBLIC_API_URL || ""; // Actually backend URL usually

  // Remove trailing slash from base URL if present
  const baseUrl = imageBaseUrl.endsWith("/") ? imageBaseUrl.slice(0, -1) : imageBaseUrl;

  // Remove leading slash from URL if present
  const imagePath = url.startsWith("/") ? url : `/${url}`;

  // If NEXT_PUBLIC_IMAGE_URL is explicitly set, use it, else fallback to backend
  const secondaryBase = process.env.NEXT_PUBLIC_IMAGE_URL || baseUrl;

  return `${secondaryBase.endsWith("/") ? secondaryBase.slice(0, -1) : secondaryBase}${imagePath}`;
}
