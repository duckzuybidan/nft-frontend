"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getNonceApi, verifySignatureApi, syncOwnershipApi } from "@/apis/auth";
import { ACCESS_TOKEN } from "@/lib/var";
import { signMessage } from "@/lib/utils";
import { toast } from "sonner";

export const useAuth = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();

  const [token, setToken] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const { nonce } = await getNonceApi({ address });

      const { message, signature } = await signMessage(
        address,
        nonce,
        signMessageAsync,
      );

      return verifySignatureApi({
        address,
        message,
        signature,
      });
    },

    onSuccess: async (data) => {
      if (typeof window === "undefined") return;

      localStorage.setItem(ACCESS_TOKEN, data.accessToken);
      setToken(data.accessToken);

      try {
        await syncOwnershipApi();
        await queryClient.invalidateQueries({ queryKey: ["my-files"] });
        await queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      } catch (error) {
        console.error("Ownership sync failed:", error);
      }

      toast.success("Successfully logged in");
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || error.message;
      toast.error(`Login failed: ${message}`);
      console.error("Login failed:", message);
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(ACCESS_TOKEN);
      if (stored) setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      isConnected &&
      address &&
      !localStorage.getItem(ACCESS_TOKEN)
    ) {
      loginMutation.mutate();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (!isConnected && typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN);
      setToken(null);
    }
  }, [isConnected]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN);
      setToken(null);
    }
  };

  return {
    token,
    address,
    logout,
  };
};
