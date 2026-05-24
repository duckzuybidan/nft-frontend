import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
