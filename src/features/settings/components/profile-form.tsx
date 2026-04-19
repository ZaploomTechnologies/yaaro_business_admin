"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { settingsApi } from "../api/settings-api";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  website: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  logo: z.string(),
  about: z.string(),
  locations: z.array(
    z.object({
      address: z.string(),
      googleMapLink: z.string().url("Must be a valid URL").or(z.literal("")),
    })
  ),
  phones: z.array(z.object({ value: z.string() })),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: ProfileFormValues;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const { fields: locationFields, append: appendLocation, remove: removeLocation } = useFieldArray({
    control: form.control,
    name: "locations",
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: form.control,
    name: "phones",
  });

  async function onSubmit(values: ProfileFormValues) {
    setLoading(true);
    try {
      await settingsApi.updateProfile({
        ...values,
        phones: values.phones.map((p) => p.value),
      });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>
          Update your business information visible to users.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" className="bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourbusiness.com" className="bg-background" {...field} />
                      </FormControl>
                      <FormDescription>Optional website link.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About Business</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your business" 
                          className="min-h-[150px] bg-background resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>A brief description of your brand.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="lg:col-span-1">
                <div className="p-6 border rounded-xl bg-muted/20 space-y-4">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Business Logo</FormLabel>
                        <FormControl>
                          <div className="pt-2">
                            <ImageUploader
                              value={field.value}
                              onChange={field.onChange}
                              onUpload={async (file) => {
                                const formData = new FormData();
                                formData.append("image", file);
                                const res = await settingsApi.uploadImage(formData);
                                return res.data.url;
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="mt-4">
                          Upload a high-quality square logo. This will be visible to your customers.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Phone Numbers</h3>
                  <p className="text-sm text-muted-foreground">Add one or more contact numbers.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendPhone({ value: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Phone
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {phoneFields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`phones.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2 p-1 bg-background border rounded-lg focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                            <Input 
                              placeholder="e.g. +1 234 567 890" 
                              className="border-none focus-visible:ring-0" 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePhone(index)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Locations</h3>
                  <p className="text-sm text-muted-foreground">Add your business addresses and Google Map links.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendLocation({ address: "", googleMapLink: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Location
                </Button>
              </div>

              <div className="grid gap-6">
                {locationFields.map((field, index) => (
                  <div key={field.id} className="group relative p-6 border rounded-xl bg-muted/10 hover:bg-muted/20 hover:border-primary/20 transition-all duration-200">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLocation(index)}
                      className="absolute top-4 right-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`locations.${index}.address`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Full Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter full address" 
                                className="min-h-[80px] bg-background resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`locations.${index}.googleMapLink`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Google Map Link</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://maps.google.com/..." 
                                className="bg-background" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>Direct link to this location on Google Maps.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-start">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
