"use client";

import { useMyFiles } from "@/hooks/file-hook";
import { formatBytes } from "@/lib/utils";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Film,
  Music,
  Type,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { DeleteConfirmModal } from "./delete-confirm-modal";
import { ListFileModal } from "./list-file-modal";
import { Tag } from "lucide-react";

export function CollectionView() {
  const {
    files,
    isLoading,
    updateFile,
    deleteFile,
    isUpdating,
    isDeleting,
    openFile,
    isOpening,
  } = useMyFiles();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [listingFile, setListingFile] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateFile({ fileId: id, fileName: editName });
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update file", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteFile(deletingId);
      setDeletingId(null);
    } catch (error) {
      console.error("Failed to delete file", error);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return null;
    if (mimeType.startsWith("video/"))
      return <Film className="h-8 w-8 text-blue-500" />;
    if (mimeType.startsWith("audio/"))
      return <Music className="h-8 w-8 text-purple-500" />;
    if (mimeType.startsWith("text/"))
      return <Type className="h-8 w-8 text-orange-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">
          Loading your collection...
        </p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="border-dashed flex flex-col items-center justify-center py-20">
        <CardHeader className="text-center">
          <CardTitle>No files found</CardTitle>
          <CardDescription>You haven't uploaded any files yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/upload">Upload your first file</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {files.map((file) => (
          <Card
            key={file.id}
            className="overflow-hidden group hover:shadow-md transition-all duration-300 border-muted-foreground/10"
          >
            <div className="aspect-square relative bg-muted/20 flex items-center justify-center overflow-hidden">
              {file.previewImage ? (
                <img
                  src={file.previewImage}
                  alt={file.fileName}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  {getFileIcon(file.mimeType)}
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                    {file.mimeType.split("/")[1]}
                  </span>
                </div>
              )}
              <div
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                onClick={() =>
                  openFile({ fileId: file.id, mimeType: file.mimeType })
                }
              >
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    openFile({ fileId: file.id, mimeType: file.mimeType });
                  }}
                  disabled={isOpening}
                >
                  {isOpening ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        onClick={() =>
                          openFile({
                            fileId: file.id,
                            mimeType: file.mimeType,
                          })
                        }
                      >
                        <Eye className="h-3.5 w-3.5 mr-2" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStartEdit(file.id, file.fileName)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setListingFile({ id: file.id, name: file.fileName })
                        }
                      >
                        <Tag className="h-3.5 w-3.5 mr-2" />
                        List on Market
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeletingId(file.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            <CardHeader className="p-3 space-y-0.5">
              {editingId === file.id ? (
                <div className="flex items-center gap-1 mb-1">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-xs px-2"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit(file.id);
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-green-600"
                    onClick={() => handleSaveEdit(file.id)}
                    disabled={isUpdating}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <CardTitle
                  className="text-xs font-medium truncate cursor-pointer hover:text-primary transition-colors"
                  title={file.fileName}
                  onClick={() =>
                    openFile({ fileId: file.id, mimeType: file.mimeType })
                  }
                >
                  {file.fileName}
                </CardTitle>
              )}
              <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                <span>{formatBytes(file.size)}</span>
                <span>
                  {new Date(file.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      <DeleteConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
      <ListFileModal
        fileId={listingFile?.id || null}
        fileName={listingFile?.name || ""}
        isOpen={!!listingFile}
        onClose={() => setListingFile(null)}
      />
    </>
  );
}
