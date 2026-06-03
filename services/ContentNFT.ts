// services/ContentNFTService.js

import {
  getAccount,
  readContract,
  writeContract,
  waitForTransactionReceipt,
  type Config,
} from "@wagmi/core";

import { parseEther } from "viem";
 
const { default: ContentNFTABI }  = await import("../artifacts/contracts/ERC_721.sol/ContentNFT.json", { with: { type: "json" } });  
const { default: AccessTokenABI }  = await import("../artifacts/contracts/ERC_1155.sol/AccessToken.json", { with: { type: "json" } });  
 

export enum ContentType {
  VIDEO = 0,
  IMAGE = 1,
  AUDIO = 2,
  EBOOK = 3,
  SOFTWARE = 4,
  OTHER = 5,
}

export interface PublishContentParams {
  metadataURI: string;
  contentHash: `0x${string}`;
  contentType: ContentType;
  title: string;
  contentPrice?: string;
  accessPrice?: string;
  maxPasses?: number;
}

export class ContentNFTService {

  private config: Config;

  private contentNFTAddress:
    `0x${string}`;

  private accessTokenAddress:
    `0x${string}`;

  constructor(
    config: Config,

    contentNFTAddress:
      `0x${string}`,

    accessTokenAddress:
      `0x${string}`,
  ) {

    this.config = config;

    this.contentNFTAddress =
      contentNFTAddress;

    this.accessTokenAddress =
      accessTokenAddress;
  }

  // ─────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────

  private requireWallet() {

    const account =
      getAccount(this.config);

    if (!account.isConnected) {

      throw new Error(
        "Wallet not connected",
      );
    }

    return account;
  }

  private async wait(
    hash: `0x${string}`,
  ) {

    return waitForTransactionReceipt(
      this.config,
      { hash },
    );
  }

  // ═════════════════════════════════════
  // WRITE FUNCTIONS
  // ═════════════════════════════════════

  async publishContent({
    metadataURI,
    contentHash,
    contentType,
    title,
    contentPrice = "0",
    accessPrice = "0",
    maxPasses = 0,
  }: PublishContentParams) {

    this.requireWallet();

    const hash =
      await writeContract(
        this.config,
        {
          address:
            this.contentNFTAddress,

          abi:
            ContentNFTABI.abi,

          functionName:
            "publishContent",

          args: [
            metadataURI,
            contentHash,
            contentType,
            title,
            parseEther(contentPrice),
            parseEther(accessPrice),
            BigInt(maxPasses),
          ],
        },
      );

    const receipt =
      await this.wait(hash);

    return {
      hash,
      receipt,
    };
  }

  async purchaseContent(
    contentId: number,
    priceEth: string,
  ) {

    this.requireWallet();

    const hash =
      await writeContract(
        this.config,
        {
          address:
            this.contentNFTAddress,

          abi:
            ContentNFTABI.abi,

          functionName:
            "purchaseContent",

          args: [
            BigInt(contentId),
          ],

          value:
            parseEther(priceEth),
        },
      );

    return {
      hash,
      receipt:
        await this.wait(hash),
    };
  }

  async grantAccess(
    contentId: number,
    to: `0x${string}`,
    amount: number,
  ) {

    this.requireWallet();

    const hash =
      await writeContract(
        this.config,
        {
          address:
            this.contentNFTAddress,

          abi:
            ContentNFTABI.abi,

          functionName:
            "grantAccess",

          args: [
            BigInt(contentId),
            to,
            BigInt(amount),
          ],
        },
      );

    return {
      hash,
      receipt:
        await this.wait(hash),
    };
  }

  async purchaseAccess(
    contentId: number,
    amount: number,
    pricePerPassEth: string,
  ) {

    this.requireWallet();

    const total =
      parseEther(
        pricePerPassEth,
      ) * BigInt(amount);

    const hash =
      await writeContract(
        this.config,
        {
          address:
            this.contentNFTAddress,

          abi:
            ContentNFTABI.abi,

          functionName:
            "purchaseAccess",

          args: [
            BigInt(contentId),
            BigInt(amount),
          ],

          value: total,
        },
      );

    return {
      hash,
      receipt:
        await this.wait(hash),
    };
  }

  async revokeAccess(
    contentId: number,
    from: `0x${string}`,
    amount: number,
  ) {

    this.requireWallet();

    const hash =
      await writeContract(
        this.config,
        {
          address:
            this.contentNFTAddress,

          abi:
            ContentNFTABI.abi,

          functionName:
            "revokeAccess",

          args: [
            BigInt(contentId),
            from,
            BigInt(amount),
          ],
        },
      );

    return {
      hash,
      receipt:
        await this.wait(hash),
    };
  }

  async setContentPrice(
    contentId: number,
    newPriceEth: string,
  ) {

    this.requireWallet();

    const hash =
      await writeContract(
        this.config,
        {
          address:
            this.contentNFTAddress,

          abi:
            ContentNFTABI.abi,

          functionName:
            "setContentPrice",

          args: [
            BigInt(contentId),
            parseEther(
              newPriceEth,
            ),
          ],
        },
      );

    return {
      hash,
      receipt:
        await this.wait(hash),
    };
  }

  async setAccessPrice(
    contentId: number,
    newPriceEth: string,
  ) {

    this.requireWallet();

    const hash =
      await writeContract(
        this.config,
        {
          address:
            this.contentNFTAddress,

          abi:
            ContentNFTABI.abi,

          functionName:
            "setAccessPrice",

          args: [
            BigInt(contentId),
            parseEther(
              newPriceEth,
            ),
          ],
        },
      );

    return {
      hash,
      receipt:
        await this.wait(hash),
    };
  }

  async withdraw() {

    this.requireWallet();

    const hash =
      await writeContract(
        this.config,
        {
          address:
            this.contentNFTAddress,

          abi:
            ContentNFTABI.abi,

          functionName:
            "withdraw",

          args: [],
        },
      );

    return {
      hash,
      receipt:
        await this.wait(hash),
    };
  }

  // ═════════════════════════════════════
  // READ FUNCTIONS
  // ═════════════════════════════════════

  async ownerOf(
    tokenId: number,
  ) {

    return readContract(
      this.config,
      {
        address:
          this.contentNFTAddress,

        abi:
          ContentNFTABI.abi,

        functionName:
          "ownerOf",

        args: [
          BigInt(tokenId),
        ],
      },
    );
  }

  async contentInfo(
    tokenId: number,
  ) {

    return readContract(
      this.config,
      {
        address:
          this.contentNFTAddress,

        abi:
          ContentNFTABI.abi,

        functionName:
          "contentInfo",

        args: [
          BigInt(tokenId),
        ],
      },
    );
  }

  async tokenURI(
    tokenId: number,
  ) {

    return readContract(
      this.config,
      {
        address:
          this.contentNFTAddress,

        abi:
          ContentNFTABI.abi,

        functionName:
          "tokenURI",

        args: [
          BigInt(tokenId),
        ],
      },
    );
  }

  async canAccess(
    viewer: `0x${string}`,
    tokenId: number,
  ) {

    return readContract(
      this.config,
      {
        address:
          this.accessTokenAddress,

        abi:
          AccessTokenABI.abi,

        functionName:
          "canAccess",

        args: [
          viewer,
          BigInt(tokenId),
        ],
      },
    );
  }

  async accessBalanceOf(
    address: `0x${string}`,
    tokenId: number,
  ) {

    return readContract(
      this.config,
      {
        address:
          this.accessTokenAddress,

        abi:
          AccessTokenABI.abi,

        functionName:
          "balanceOf",

        args: [
          address,
          BigInt(tokenId),
        ],
      },
    );
  }
}