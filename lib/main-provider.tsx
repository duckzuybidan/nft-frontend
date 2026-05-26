"use client";

import { WagmiProvider, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { Toaster } from "sonner";

const config = getDefaultConfig({
  appName: "NFT MARKET",
  projectId: "1a461664f1ea4a1471296923796ce452",

  chains: [mainnet, sepolia],

  transports: {
    [mainnet.id]: http("https://rpc.ankr.com/eth"),

    [sepolia.id]: http("https://rpc.ankr.com/eth_sepolia"),
  },
});

const queryClient = new QueryClient();

export function MainProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
          <Toaster position="top-center" richColors />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
