"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/auth-hook";
import { UserMenu } from "./user-menu";

export default function Header() {
  const { token: accessToken } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center px-4 gap-4">
        {/* Logo Section */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl shrink-0"
        >
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <span className="text-lg">⛵</span>
          </div>
          <span className="hidden md:inline-block">NFT MARKET</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium ml-4">
          <Link
            href="/market"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Marketplace
          </Link>
          <Link
            href="/my-collection"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            My Collection
          </Link>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 hidden md:flex items-center relative group">
          <div className="absolute left-3 text-muted-foreground group-focus-within:text-foreground transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search items, collections"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-muted/50 hover:bg-muted focus:bg-background focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Desktop User Actions */}
          {accessToken && <UserMenu />}

          {/* Connect Wallet */}
          <div className="ml-2">
            <ConnectButton showBalance={true} />
          </div>
        </div>
      </div>
    </header>
  );
}
