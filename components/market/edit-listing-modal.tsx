"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useMarket } from "@/hooks/market-hook";
import { Loader2 } from "lucide-react";
import { ListingResponse } from "@/apis/market";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z
  .object({
    buyPrice: z.string().optional(),
    hirePrice: z.string().optional(),
  })
  .refine((data) => data.buyPrice || data.hirePrice, {
    message: "At least one price (sale or hire) must be provided",
    path: ["buyPrice"],
  });

type FormValues = z.infer<typeof formSchema>;

interface EditListingModalProps {
  listing: ListingResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditListingModal({
  listing,
  isOpen,
  onClose,
}: EditListingModalProps) {
  const { updateListing, isUpdating } = useMarket();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyPrice: "",
      hirePrice: "",
    },
  });

  useEffect(() => {
    if (listing) {
      form.reset({
        buyPrice: listing.buyPrice || "",
        hirePrice: listing.hirePrice || "",
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
        },
      });
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
            Update your prices for "{listing?.file.metadata.fileName}".
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
