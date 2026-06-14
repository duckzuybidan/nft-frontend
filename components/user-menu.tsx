"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth-hook";
import { Upload, LayoutGrid, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const { address } = useAuth();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src="" alt={address || "User"} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
              {address ? address.slice(2, 4).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Wallet Address</p>
            <p className="text-xs leading-none text-muted-foreground">
              {address ? truncateAddress(address) : "Not connected"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/my-collection">
            <DropdownMenuItem className="cursor-pointer">
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>My Collection</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/market">
            <DropdownMenuItem className="cursor-pointer">
              <ShoppingBag className="mr-2 h-4 w-4" />
              <span>Marketplace</span>
            </DropdownMenuItem>
          </Link>
          <Link href="/upload">
            <DropdownMenuItem className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
