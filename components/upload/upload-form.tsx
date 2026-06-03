"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FileUp, Loader2, X, FileText, Film, Music, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatBytes } from "@/lib/utils";
import { useUpload } from "@/hooks/upload-hook";

const formSchema = z.object({
  file: z.any().refine((files) => files?.length > 0, "File is required."),
});

export function UploadForm() {
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
    type: string;
    preview?: string;
  } | null>(null);
  const { uploadFile, isUploading } = useUpload();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await uploadFile(values.file[0]);
    form.reset();
    setFileInfo(null);
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldChange: (value: any) => void,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const info: any = {
        name: file.name,
        size: formatBytes(file.size),
        type: file.type,
      };

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFileInfo({ ...info, preview: reader.result as string });
        };
        reader.readAsDataURL(file);
      } else {
        setFileInfo(info);
      }

      fieldChange(e.target.files);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return null;
    if (type.startsWith("video/"))
      return <Film className="h-12 w-12 text-blue-500" />;
    if (type.startsWith("audio/"))
      return <Music className="h-12 w-12 text-purple-500" />;
    if (type.startsWith("text/"))
      return <Type className="h-12 w-12 text-orange-500" />;
    return <FileText className="h-12 w-12 text-gray-500" />;
  };

  const clearFile = () => {
    setFileInfo(null);
    form.setValue("file", undefined);
  };

  return (
    <Card className="border-2">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Upload File</CardTitle>
        <CardDescription>
          Choose any file to upload to the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center">
                      {!fileInfo ? (
                        <div
                          className="w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer group"
                          onClick={() =>
                            document.getElementById("file-upload")?.click()
                          }
                        >
                          <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <FileUp className="h-10 w-10 text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-medium">
                              Click to select a file
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Any file type supported
                            </p>
                          </div>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, onChange)}
                            {...rest}
                          />
                        </div>
                      ) : (
                        <div className="w-full p-6 border-2 border-primary/20 rounded-2xl bg-primary/5 relative animate-in fade-in zoom-in duration-300">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 hover:bg-destructive/10 hover:text-destructive"
                            onClick={clearFile}
                          >
                            <X className="h-4 w-4" />
                          </Button>

                          <div className="flex items-center gap-6">
                            <div className="shrink-0">
                              {fileInfo.preview ? (
                                <img
                                  src={fileInfo.preview}
                                  alt="Preview"
                                  className="h-20 w-20 object-cover rounded-lg shadow-sm"
                                />
                              ) : (
                                <div className="h-20 w-20 bg-background rounded-lg flex items-center justify-center shadow-sm border">
                                  {getFileIcon(fileInfo.type)}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate mb-1">
                                {fileInfo.name}
                              </p>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span>{fileInfo.size}</span>
                                <span>•</span>
                                <span className="uppercase">
                                  {fileInfo.type.split("/")[1] || "Unknown"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20"
              disabled={isUploading || !fileInfo}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload File"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
