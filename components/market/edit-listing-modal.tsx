"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ListingType } from "@/types/listing-type";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMarket } from "@/hooks/market-hook";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z
  .object({
    buyPrice: z.string().optional(),
    hirePrice: z.string().optional(),
    isActive: z.boolean(),
  })
  .refine((data) => !data.isActive || data.buyPrice || data.hirePrice, {
    message: "Active listings need at least one price (sale or hire)",
    path: ["buyPrice"],
  });

type FormValues = z.infer<typeof formSchema>;

interface EditListingModalProps {
  listing: ListingType | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function EditListingModal({
  listing,
  isOpen,
  onClose,
  onUpdated,
}: EditListingModalProps) {
  const { updateListing, isUpdating } = useMarket();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyPrice: "",
      hirePrice: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (listing) {
      form.reset({
        buyPrice: listing.buyPrice != null ? String(listing.buyPrice) : "",
        hirePrice: listing.hirePrice != null ? String(listing.hirePrice) : "",
        isActive: listing.isActive,
      });
    }
  }, [listing, form]);

  const onSubmit = async (values: FormValues) => {
    if (!listing) return;

    try {
      await updateListing({
        listingId: listing.id,
        data: {
          buyPrice: values.buyPrice || undefined,
          hirePrice: values.hirePrice || undefined,
          isActive: values.isActive,
        },
      });
      onUpdated?.();
      onClose();
    } catch (error) {
      console.error("Failed to update listing", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
          <DialogDescription>
            Update prices and active status for &quot;
            {listing?.file.metadata.fileName}&quot;.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="buyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Price (ETH)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="e.g. 0.05"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hirePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hire Price (ETH / day)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="e.g. 0.005"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-primary"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        id="listing-is-active"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <Label
                        htmlFor="listing-is-active"
                        className="cursor-pointer font-medium"
                      >
                        Active on marketplace
                      </Label>
                      <FormDescription>
                        Inactive listings are hidden from the public market but
                        keep their prices so you can re-activate later.
                      </FormDescription>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Listing"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
