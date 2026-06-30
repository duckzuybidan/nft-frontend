
import { config }
from "../lib/main-provider";

import {
  ContentNFTService,
} from "./ContentNFT";

export const nftService =
  new ContentNFTService(
    config, 
    "0x8D6Cc5E437462C3572268872B22123A205052332",
    "0xYourAccessTokenAddress",
  );