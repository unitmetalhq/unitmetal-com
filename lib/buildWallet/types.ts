import { Address } from "viem";

export type AlchemyGetTokenBalancesRequest = {
  address: Address;
  tokenSpec: "erc20";
  options?: {
    pageKey?: string;
    maxCount?: number;
  }
};

export type AlchemyGetTokenBalancesResponse = {
  address: Address;
  tokenBalances: TokenBalance[];
};

export type TokenBalance = {
  contractAddress: Address;
  tokenBalance: string;
};