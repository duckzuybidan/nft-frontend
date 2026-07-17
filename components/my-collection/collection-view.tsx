"use client";

import { useMyFiles } from "@/hooks/file-hook";
import { formatBytes } from "@/lib/utils";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
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
  LayoutGrid,
  Upload,
  Copy,
  Crown,
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
import { MoveToCollectionModal } from "./move-to-collection-modal";
import { Tag } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import type { FileType } from "@/types/file-type";

type Tab = "owned" | "copies";

export function CollectionView() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("owned");

  const {
    ownedFiles,
    copyFiles,
    isLoading,
    isFetching,
    updateFile,
    deleteFile,
    isUpdating,
    isDeleting,
    pagination,
  } = useMyFiles();

  const files = tab === "owned" ? ownedFiles : copyFiles;
  const isCopyTab = tab === "copies";

  const openViewer = (file: {
    id: string;
    fileName: string;
    mimeType: string;
  }) => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        `file-meta-${file.id}`,
        JSON.stringify({ fileName: file.fileName, mimeType: file.mimeType }),
      );
    }
    router.push(`/files/${file.id}`);
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [listingFile, setListingFile] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [moveFile, setMoveFile] = useState<{
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

  const emptyBoth = useMemo(
    () =>
      !isLoading &&
      ownedFiles.length === 0 &&
      copyFiles.length === 0 &&
      pagination.ownedTotal === 0 &&
      pagination.copiesTotal === 0,
    [
      isLoading,
      ownedFiles.length,
      copyFiles.length,
      pagination.ownedTotal,
      pagination.copiesTotal,
    ],
  );

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

  if (emptyBoth) {
    return (
      <Card className="border-dashed flex flex-col items-center justify-center py-20 bg-muted/5">
        <CardHeader className="text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <LayoutGrid className="h-7 w-7 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">Your collection is empty</CardTitle>
          <CardDescription className="max-w-sm mx-auto">
            Upload and mint ERC-721 content you own, or buy ERC-1155 copies from
            the marketplace to stream and view.
          </CardDescription>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload your first file
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/market">Browse marketplace</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={tab === "owned" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setTab("owned")}
        >
          <Crown className="h-3.5 w-3.5" />
          Owned content
          <span className="text-xs opacity-80">({pagination.ownedTotal})</span>
        </Button>
        <Button
          variant={tab === "copies" ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setTab("copies")}
        >
          <Copy className="h-3.5 w-3.5" />
          Licensed copies
          <span className="text-xs opacity-80">({pagination.copiesTotal})</span>
        </Button>
        <p className="text-xs text-muted-foreground w-full sm:w-auto sm:ml-2">
          {tab === "owned"
            ? "ERC-721 ownership — list, rename, delete"
            : "ERC-1155 access — stream/view only"}
        </p>
      </div>

      {isFetching && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {files.length === 0 ? (
        <Card className="border-dashed py-14 bg-muted/5">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">
              {isCopyTab ? "No licensed copies yet" : "No owned content yet"}
            </CardTitle>
            <CardDescription className="max-w-md mx-auto">
              {isCopyTab
                ? "Buy a Copy on the marketplace to get ERC-1155 viewing access. Copies appear here after purchase."
                : "Upload a file or buy Content ownership (ERC-721) to populate this tab."}
            </CardDescription>
            <div className="pt-4">
              <Button asChild variant="outline">
                <Link href={isCopyTab ? "/market" : "/upload"}>
                  {isCopyTab ? "Browse marketplace" : "Upload file"}
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {files.map((file) => (
            <FileCard
              key={`${file.accessType}-${file.id}`}
              file={file}
              isCopy={file.accessType === "copy"}
              editingId={editingId}
              editName={editName}
              isUpdating={isUpdating}
              getFileIcon={getFileIcon}
              openViewer={openViewer}
              setEditName={setEditName}
              handleStartEdit={handleStartEdit}
              handleCancelEdit={handleCancelEdit}
              handleSaveEdit={handleSaveEdit}
              setListingFile={setListingFile}
              setDeletingId={setDeletingId}
              setMoveFile={setMoveFile}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={pagination.setPage}
      />
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
      <MoveToCollectionModal
        fileId={moveFile?.id || null}
        fileName={moveFile?.name || ""}
        isOpen={!!moveFile}
        onClose={() => setMoveFile(null)}
      />
    </div>
  );
}

function FileCard({
  file,
  isCopy,
  editingId,
  editName,
  isUpdating,
  getFileIcon,
  openViewer,
  setEditName,
  handleStartEdit,
  handleCancelEdit,
  handleSaveEdit,
  setListingFile,
  setDeletingId,
  setMoveFile,
}: {
  file: FileType;
  isCopy: boolean;
  editingId: string | null;
  editName: string;
  isUpdating: boolean;
  getFileIcon: (mimeType: string) => ReactNode;
  openViewer: (file: {
    id: string;
    fileName: string;
    mimeType: string;
  }) => void;
  setEditName: (v: string) => void;
  handleStartEdit: (id: string, name: string) => void;
  handleCancelEdit: () => void;
  handleSaveEdit: (id: string) => void;
  setListingFile: (v: { id: string; name: string } | null) => void;
  setDeletingId: (v: string | null) => void;
  setMoveFile: (v: { id: string; name: string } | null) => void;
}) {
  return (
    <Card className="overflow-hidden group hover:shadow-md transition-all duration-300 border-muted-foreground/10">
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

        <div className="absolute top-2 left-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
              isCopy
                ? "bg-secondary text-secondary-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {isCopy ? (
              <>
                <Copy className="h-3 w-3" />
                Copy
                {file.copyBalance ? ` ×${file.copyBalance}` : ""}
              </>
            ) : (
              <>
                <Crown className="h-3 w-3" />
                Owned
              </>
            )}
          </span>
        </div>

        <div
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          onClick={() => openViewer(file)}
        >
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              openViewer(file);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="secondary" className="h-8 w-8">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => openViewer(file)}>
                  <Eye className="h-3.5 w-3.5 mr-2" />
                  {isCopy ? "View / Stream" : "View"}
                </DropdownMenuItem>
                {isCopy ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/my-copy-listings?fileId=${file.id}`}>
                      <Tag className="h-3.5 w-3.5 mr-2" />
                      List on Buy Copies
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        setMoveFile({ id: file.id, name: file.fileName })
                      }
                    >
                      <LayoutGrid className="h-3.5 w-3.5 mr-2" />
                      Move to Collection
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
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <CardHeader className="p-3 space-y-0.5">
        {editingId === file.id && !isCopy ? (
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
            onClick={() => openViewer(file)}
          >
            {file.fileName}
          </CardTitle>
        )}
        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
          <span>{formatBytes(file.size)}</span>
          <span>
            {isCopy
              ? "License"
              : new Date(file.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
          </span>
        </div>
      </CardHeader>
    </Card>
  );
}
