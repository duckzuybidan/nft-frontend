"use client";

import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { getNonce, verifySignature } from "@/apis/auth";
import { ACCESS_TOKEN } from "@/lib/var";
import { signMessage } from "@/lib/utils";

export const useAuth = () => {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const [token, setToken] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Wallet not connected");

      const { nonce } = await getNonce({ address });

      const { message, signature } = await signMessage(
        address,
        nonce,
        signMessageAsync,
      );

      return verifySignature({
        address,
        message,
        signature,
      });
    },

    onSuccess: (data) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(ACCESS_TOKEN, data.accessToken);
        setToken(data.accessToken);
      }
    },

    onError: (error) => {
      console.error("Login failed:", error);
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
