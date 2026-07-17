"use client";

import { useEffect, useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createCollectionApi,
  getMyCollectionsApi,
  type CollectionType,
} from "@/apis/collection";
import { ContentType } from "@/services/ContentNFT";
import { toast } from "sonner";

const CATEGORIES = [
  "Art",
  "Music",
  "Photography",
  "Video",
  "Documents",
  "Gaming",
  "AI",
  "3D",
  "Collectibles",
];

const CONTENT_TYPES = [
  { value: ContentType.VIDEO, label: "Video" },
  { value: ContentType.IMAGE, label: "Image" },
  { value: ContentType.AUDIO, label: "Audio" },
  { value: ContentType.EBOOK, label: "Ebook / Document" },
  { value: ContentType.SOFTWARE, label: "Software" },
  { value: ContentType.OTHER, label: "Other" },
] as const;

const formSchema = z
  .object({
    buyPrice: z.string().optional(),
    copyPrice: z.string().optional(),
    maxCopies: z.string().optional(),
    contentType: z.string(),
    collectionMode: z.enum(["none", "existing", "new"]),
    collectionId: z.string().optional(),
    newCollectionName: z.string().optional(),
    newCollectionCategory: z.string().optional(),
  })
  .refine((data) => data.buyPrice || data.copyPrice, {
    message: "At least one price (Buy Content or Buy Copy) must be provided",
    path: ["buyPrice"],
  })
  .refine(
    (data) =>
      data.collectionMode !== "existing" || Boolean(data.collectionId),
    { message: "Select a collection", path: ["collectionId"] },
  )
  .refine(
    (data) =>
      data.collectionMode !== "new" ||
      Boolean(data.newCollectionName?.trim()),
    { message: "Enter a collection name", path: ["newCollectionName"] },
  );

type FormValues = z.infer<typeof formSchema>;

interface ListFileModalProps {
  fileId: string | null;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ListFileModal({
  fileId,
  fileName,
  isOpen,
  onClose,
}: ListFileModalProps) {
  const { listFile, isListing } = useMarket();
  const [collections, setCollections] = useState<CollectionType[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyPrice: "",
      copyPrice: "",
      maxCopies: "100",
      contentType: String(ContentType.OTHER),
      collectionMode: "none",
      collectionId: "",
      newCollectionName: "",
      newCollectionCategory: "Collectibles",
    },
  });

  const collectionMode = form.watch("collectionMode");

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      return;
    }
    setLoadingCollections(true);
    getMyCollectionsApi()
      .then(setCollections)
      .catch(() => setCollections([]))
      .finally(() => setLoadingCollections(false));
  }, [isOpen, form]);

  const onSubmit = async (values: FormValues) => {
    if (!fileId) return;

    try {
      let collectionId = values.collectionId || undefined;

      if (values.collectionMode === "new" && values.newCollectionName) {
        const created = await createCollectionApi({
          name: values.newCollectionName.trim(),
          category: values.newCollectionCategory || "Collectibles",
        });
        collectionId = created.id;
        toast.success(`Collection “${created.name}” created`);
      }

      if (values.collectionMode === "none") {
        collectionId = undefined;
      }

      await listFile({
        fileId,
        fileName,
        buyPrice: values.buyPrice || undefined,
        copyPrice: values.copyPrice || undefined,
        maxCopies: values.maxCopies
          ? Number.parseInt(values.maxCopies, 10)
          : 100,
        collectionId,
        contentType: Number.parseInt(values.contentType, 10),
      });
      onClose();
    } catch (error) {
      console.error("Failed to list file", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>List on Marketplace</DialogTitle>
          <DialogDescription>
            Set prices, content type, and optionally assign &quot;{fileName}
            &quot; to a collection before minting.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="buyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buy Content Price (ETH)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="Ownership NFT — e.g. 0.05"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="copyPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buy Copy Price (ETH)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="Licensed copy — e.g. 0.005"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxCopies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Copies</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} step={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content type</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {CONTENT_TYPES.map((t) => (
                        <option key={t.value} value={String(t.value)}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-sm font-medium">Collection</p>
              <p className="text-xs text-muted-foreground">
                Owned collections and collections where you are an approved
                contributor.
              </p>
              <FormField
                control={form.control}
                name="collectionMode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            ["none", "Skip"],
                            ["existing", "Existing"],
                            ["new", "Create new"],
                          ] as const
                        ).map(([value, label]) => (
                          <Button
                            key={value}
                            type="button"
                            size="sm"
                            variant={
                              field.value === value ? "default" : "outline"
                            }
                            onClick={() => field.onChange(value)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {collectionMode === "existing" && (
                <FormField
                  control={form.control}
                  name="collectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your collections</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          disabled={loadingCollections}
                          value={field.value}
                          onChange={field.onChange}
                        >
                          <option value="">
                            {loadingCollections
                              ? "Loading..."
                              : "Select collection"}
                          </option>
                          {collections.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                              {c.membershipRole === "contributor"
                                ? " (contributor)"
                                : ""}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {collectionMode === "new" && (
                <>
                  <FormField
                    control={form.control}
                    name="newCollectionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My collection" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newCollectionCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isListing}>
                {isListing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Listing...
                  </>
                ) : (
                  "Confirm Listing"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
