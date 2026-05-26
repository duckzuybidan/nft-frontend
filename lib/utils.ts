import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export async function signMessage(
  address: string,
  nonce: string,
  signMessageAsync: (args: { message: string }) => Promise<string>,
) {
  const message = `${window.location.host} wants you to sign in with your Ethereum account:
${address}

Sign in to NFT Market

URI: ${window.location.origin}
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${new Date().toISOString()}
`;

  const signature = await signMessageAsync({
    message,
  });

  return {
    message,
    signature,
  };
}
