"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { MultipleImageUploader } from "@/components/ui/multiple-image-uploader";
import { APP_CONFIG } from "@/config/app-config";
import { offersApi } from "../api/offers-api";
import { COMMON_TERMS } from "../constants/terms-constants";
import type { Offer, Category } from "../types/offers";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()),
  whereToRedeem: z.enum(["online", "offline"]),
  redeemCode: z.string().optional(),
  redeemedExpiry: z.coerce.number().min(0),
  termsCondition: z.string().optional(),
  offerType: z.enum(["upto", "discount", "flat"]),
  minPrice: z.coerce.number().min(0),
  maxPrice: z.coerce.number().min(0),
  discountPercentage: z.coerce.number().min(0).max(100),
  rewardPoints: z.coerce.number().min(0),
}).refine((data) => {
  if (data.whereToRedeem === "online" && (!data.redeemCode || data.redeemCode.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Redeem code is required when redemption is online",
  path: ["redeemCode"],
});

interface OffersFormProps {
  initialData?: Offer | null;
}

type OfferFormValues = z.infer<typeof formSchema>;

function parseTermsFromHtml(html: string): { predefinedIds: string[]; customTerms: string[] } {
  if (!html) return { predefinedIds: [], customTerms: [] };
  const liMatches = html.match(/<li>(.*?)<\/li>/g) || [];
  const labels = liMatches.map((li) => li.replace(/<\/?li>/g, "").trim());
  const predefinedIds: string[] = [];
  const customTermsList: string[] = [];
  labels.forEach((label) => {
    const found = COMMON_TERMS.find((t) => t.label === label);
    if (found) predefinedIds.push(found.id);
    else customTermsList.push(label);
  });
  return { predefinedIds, customTerms: customTermsList };
}

export function OffersForm({ initialData }: OffersFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const isEdit = !!initialData;

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(formSchema) as Resolver<OfferFormValues>,
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description || "",
          categoryId: typeof initialData.categoryId === "string" 
            ? initialData.categoryId 
            : (initialData.categoryId as any)?._id || "",
          images: initialData.images || [],
          redeemCode: initialData.redeemCode || "",
          redeemedExpiry: initialData.redeemedExpiry || 0,
          termsCondition: Array.isArray(initialData.termsCondition as any) 
            ? (initialData.termsCondition as any).join("\n") 
            : (initialData.termsCondition || ""),
          offerType: initialData.offerType || "upto",
          whereToRedeem: initialData.whereToRedeem || "offline",
          minPrice: initialData.minPrice || 0,
          maxPrice: initialData.maxPrice || 0,
          discountPercentage: initialData.discountPercentage || 0,
          rewardPoints: initialData.rewardPoints || 0,
        }
      : {
          title: "",
          description: "",
          categoryId: "",
          images: [],
          redeemCode: "",
          redeemedExpiry: 90,
          termsCondition: "",
          offerType: "upto",
          whereToRedeem: "offline",
          minPrice: 0,
          maxPrice: 0,
          discountPercentage: 0,
          rewardPoints: 0,
        },
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await offersApi.getCategories();
        if (res.success) {
          setCategories(res.data);
        }
      } catch (error) {
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // Smart Terms Selector State
  const [selectedTermIds, setSelectedTermIds] = useState<string[]>(() => {
    if (isEdit && initialData?.termsCondition) {
      return parseTermsFromHtml(initialData.termsCondition as string).predefinedIds;
    }
    return COMMON_TERMS.filter((t) => t.defaultChecked).map((t) => t.id);
  });
  const [customTerms, setCustomTerms] = useState<string[]>(() => {
    if (isEdit && initialData?.termsCondition) {
      return parseTermsFromHtml(initialData.termsCondition as string).customTerms;
    }
    return [];
  });
  const [customTermInput, setCustomTermInput] = useState("");

  // Sync terms to editor
  useEffect(() => {
    const selectedPredefined = COMMON_TERMS
      .filter((t) => selectedTermIds.includes(t.id))
      .map((t) => t.label);

    const allTerms = [...selectedPredefined, ...customTerms];

    if (allTerms.length > 0) {
      const html = `<ul>${allTerms.map((t) => `<li>${t}</li>`).join("")}</ul>`;
      form.setValue("termsCondition", html);
    } else {
      form.setValue("termsCondition", "");
    }
  }, [selectedTermIds, customTerms, form]);

  const handleTermToggle = (id: string) => {
    setSelectedTermIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const addCustomTerm = () => {
    if (customTermInput.trim()) {
      setCustomTerms((prev) => [...prev, customTermInput.trim()]);
      setCustomTermInput("");
    }
  };

  const removeCustomTerm = (index: number) => {
    setCustomTerms((prev) => prev.filter((_, i) => i !== index));
  };



  // Watch fields for automatic calculation
  const watchedOfferType = form.watch("offerType");
  const watchedMinPrice = form.watch("minPrice");
  const watchedMaxPrice = form.watch("maxPrice");
  const watchedDiscount = form.watch("discountPercentage");

  useEffect(() => {
    const min = Number(watchedMinPrice) || 0;
    const max = Number(watchedMaxPrice) || 0;
    const disc = Number(watchedDiscount) || 0;
    const pointsPerRs = APP_CONFIG.POINTS_PER_RS || 10;
    
    let rewardPoints = 0;
    if (watchedOfferType === "flat") {
      rewardPoints = Math.round(max * pointsPerRs);
    } else if (watchedOfferType === "discount") {
      const anchorPrice = min + 0.4 * (max - min);
      const anchorDiscount = anchorPrice * (disc / 100);
      rewardPoints = Math.round(anchorDiscount * pointsPerRs);
    } else {
      // "upto"
      const anchorDiscount = max * (disc / 100);
      rewardPoints = Math.round(anchorDiscount * pointsPerRs);
    }
    
    form.setValue("rewardPoints", rewardPoints);
  }, [watchedOfferType, watchedMinPrice, watchedMaxPrice, watchedDiscount, form]);

  async function onSubmit(values: OfferFormValues) {
    setLoading(true);
    try {
      // Transform newline-separated strings back to arrays
      const payload = {
        ...values,
        termsCondition: values.termsCondition || "",
      };

      if (isEdit && (initialData?._id || initialData?.id)) {
        const id = initialData.id || initialData._id;
        await offersApi.update(id!, payload);
        toast.success("Offer updated successfully");
      } else {
        await offersApi.create(payload);
        toast.success("Offer created successfully");
      }
      router.push("/dashboard/offers");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-5xl">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Offer" : "Create New Offer"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            {/* --- SECTION 1: BASIC INFO --- */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h3 className="text-lg font-semibold tracking-tight text-foreground/90">Basic Info</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offer Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Get 20% Off on All Shoes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value} 
                          disabled={loadingCategories}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper" className="max-h-52! overflow-y-auto">
                            {categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief summary of the offer..." 
                            className="min-h-[120px] resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MultipleImageUploader
                            label="Offer Images"
                            value={field.value}
                            onChange={field.onChange}
                            maxImages={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* --- SECTION 2: REWARD INFO --- */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h3 className="text-lg font-semibold tracking-tight text-foreground/90">Reward Info</h3>
              </div>

              <div className="space-y-8">
                {/* Row 1: Redemption + Pricing */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* How to Redeem */}
                  <div className="space-y-4 rounded-lg border bg-background p-4 shadow-sm">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <div className="h-3 w-1 bg-primary rounded-full" />
                      <Label className="text-sm font-bold text-primary/80">How to Redeem</Label>
                    </div>

                    <FormField
                      control={form.control}
                      name="whereToRedeem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Where to Redeem</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select where to redeem" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="offline">Offline</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 items-start sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="redeemCode"
                        render={({ field }) => (
                          <FormItem className={form.watch("whereToRedeem") === "offline" ? "opacity-60" : ""}>
                            <FormLabel>
                              Redeem Code
                              {form.watch("whereToRedeem") === "online" && <span className="text-destructive ml-1">*</span>}
                            </FormLabel>
                            <FormControl>
                              {form.watch("whereToRedeem") === "offline" ? (
                                <div className="h-10 px-3 py-2 rounded-md border border-input bg-muted/50 text-xs flex items-center text-muted-foreground italic">
                                  Automatically generated unique code
                                </div>
                              ) : (
                                <Input
                                  placeholder="e.g. SAVE20"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                  className="uppercase font-mono"
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                            {form.watch("whereToRedeem") === "offline" && (
                              <FormDescription className="text-[10px]">
                                Unique 8-char codes will be created for each customer.
                              </FormDescription>
                            )}
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="redeemedExpiry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Days</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>Days valid after redeem</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Offer Pricing */}
                  <div className="space-y-4 rounded-lg border bg-background p-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <div className="h-3 w-1 bg-primary rounded-full" />
                    <Label className="text-sm font-bold text-primary/80">Offer Pricing</Label>
                  </div>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="offerType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offer Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select offer type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent position="popper">
                              <SelectItem value="upto">Upto</SelectItem>
                              <SelectItem value="discount">Discount</SelectItem>
                              <SelectItem value="flat">Flat</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                       {watchedOfferType === "discount" && (
                         <FormField
                           control={form.control}
                           name="minPrice"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel>Min Price (₹)</FormLabel>
                               <FormControl>
                                 <Input type="number" placeholder="0" {...field} />
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                       )}
                       <FormField
                         control={form.control}
                         name="maxPrice"
                         render={({ field }) => (
                           <FormItem className={watchedOfferType !== "discount" ? "col-span-2" : ""}>
                             <FormLabel>Max Price (₹)</FormLabel>
                             <FormControl>
                               <Input type="number" placeholder="0" {...field} />
                             </FormControl>
                             <FormMessage />
                           </FormItem>
                         )}
                       />
                    </div>

                    {watchedOfferType !== "flat" && (
                      <FormField
                        control={form.control}
                        name="discountPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount (%)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* <div className="mt-8 rounded-lg bg-primary/10 p-4 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-primary/80">Calculated Reward</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-primary">{form.watch("rewardPoints")}</span>
                            <span className="text-xs font-semibold text-primary/70 uppercase tracking-wider">Points</span>
                          </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xl">🏆</span>
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
                        * Based on {watchedOfferType === "discount" ? "anchor price formula" : "max price"} and {APP_CONFIG.POINTS_PER_RS} pts/₹ conversion.
                      </p>
                    </div> */}
                  </div>
                </div>
              </div>

                {/* Row 2: Smart Terms Selector + T&C Editor */}
                <div className="grid grid-cols-1 gap-8 items-start md:grid-cols-2">
                  {/* Smart Terms Selector */}
                  <div className="space-y-4 rounded-lg border bg-background p-4 shadow-sm">
                    <div className="flex items-center justify-between border-b pb-2">
                      <Label className="text-sm font-bold text-primary/80">Common Terms & Conditions</Label>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">Smart Selector</Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
                      {COMMON_TERMS.map((term) => (
                        <div key={term.id} className="flex items-start space-x-3 group animate-in fade-in slide-in-from-left-2 duration-300">
                          <Checkbox
                            id={term.id}
                            checked={selectedTermIds.includes(term.id)}
                            onCheckedChange={() => handleTermToggle(term.id)}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={term.id}
                            className="text-[11px] font-medium leading-relaxed cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors"
                          >
                            {term.label}
                          </Label>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-2 opacity-50" />

                    <div className="space-y-3">
                      <Label className="text-xs font-semibold text-primary/70 uppercase tracking-wider">Custom Terms</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Valid for Delhi customers only"
                          value={customTermInput}
                          onChange={(e) => setCustomTermInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomTerm();
                            }
                          }}
                          className="h-9 text-xs"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-9 px-3 border"
                          onClick={addCustomTerm}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>

                      {customTerms.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {customTerms.map((term, index) => (
                            <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1 h-7 gap-2 text-[10px] animate-in zoom-in-95 duration-200">
                              {term}
                              <button
                                type="button"
                                onClick={() => removeCustomTerm(index)}
                                className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Terms & Conditions Preview */}
                  <div className="space-y-4 rounded-lg border bg-background p-4 shadow-sm self-start">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <div className="h-3 w-1 bg-primary rounded-full" />
                      <Label className="text-sm font-bold text-primary/80">Terms & Conditions Preview</Label>
                    </div>
                    {form.watch("termsCondition") ? (
                      <div
                        className="prose prose-sm max-w-none text-sm text-muted-foreground [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: form.watch("termsCondition") || "" }}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No terms selected yet. Use the selector on the left to add terms.</p>
                    )}
                  </div>
                </div>
              </div>


            </div>

            <div className="flex justify-end gap-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Update Offer" : "Create Offer"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
