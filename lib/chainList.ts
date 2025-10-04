import { tokenList } from "@/lib/tokenList";

// chainList is an array of strings that are the chain id and chain name but uppercase first letter and unique
export const chainList: ChainIdentifier[] = [
  ...new Set(
    tokenList.map(
      (token) =>
        `${token.chainId}:${token.chain}:${
          token.chain.charAt(0).toUpperCase() +
          token.chain.slice(1).toLowerCase()
        }` as ChainIdentifier
    )
  ),
];

export type ChainIdentifier = `${string}:${string}:${string}`;