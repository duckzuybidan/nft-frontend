"use client"; 
import { useSendTransaction, useAccount } from "wagmi";
import { parseEther } from "viem";
import { Loader2 } from "lucide-react";
 

import { Button } from "@/components/ui/button";

import { 
  useWriteContract,
} from "wagmi";

import { nftService }
from "@/services/nft"; 
 

  
 
export default function Page() {

  const { isConnected } = useAccount();

  const { 

    data: hash,

    isPending,

    isError,

    error,
  } = useWriteContract();

    const handleBuy = async () => {

    if (!isConnected) {

      alert(
        "Please connect wallet first",
      );

      return;
    }

    try {

      await nftService.publishContent({
        metadataURI: "ipfs://...",
        contentHash: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        contentType: 0,
        title: "Movie",
        contentPrice: "1",
        accessPrice: "0.01",
        maxPasses: 100,
      });

    } catch (err) {

      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <div className="max-w-md w-full p-8 border rounded-2xl shadow-lg bg-card text-card-foreground">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Demo Transaction
        </h1>
        <p className="text-muted-foreground mb-8 text-center">
          Click the button below to simulate a purchase of 0.1 ETH.
        </p>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-xl bg-muted/50">
            <span className="font-medium">Amount:</span>
            <span className="font-bold">0.1 ETH</span>
          </div>

          <Button
            onClick={handleBuy}
            disabled={isPending}
            className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              "Buy Now"
            )}
          </Button>

          {hash && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-sm text-green-600 font-medium text-center">
                Transaction Sent!
              </p>
              <p className="text-xs text-muted-foreground break-all text-center mt-1">
                Hash: {hash}
              </p>
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive text-center mt-2">
              Error: {error?.message || "Something went wrong"}
            </p>
          )}

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Connect your wallet in the header to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
