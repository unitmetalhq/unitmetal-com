"use client";
import { useReadContract } from "wagmi";
import { checkTheChainAbi } from "@/lib/abis/CheckTheChain";
import { BuildSkeleton } from "@/components/build-ui/build-skeleton";
import { formatUsdAmount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";
import { Address } from "viem";

const tokenList = [
  {
    name: "Ether",
    symbol: "ETH",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
  },
  {
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: 8,
  },
  {
    name: "Wrapped liquid staked Ether 2.0",
    symbol: "wstETH",
    address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    decimals: 18,
  },
  {
    name: "Aave Token",
    symbol: "AAVE",
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    decimals: 18,
  },
  {
    name: "Uniswap",
    symbol: "UNI",
    address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    decimals: 18,
  },
  {
    name: "Tether Gold",
    symbol: "XAUt",
    address: "0x68749665FF8D2d112Fa859AA293F07A622782F38",
    decimals: 6,
  },
  {
    name: "BNB",
    symbol: "BNB",
    address: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
    decimals: 18,
  },
];

export default function OnchainTokenPriceList() {
  const {
    data: prices,
    isLoading: isLoadingPrices,
    refetch: refetchPrices,
    isRefetching: isRefetchingPrices,
  } = useReadContract({
    address: "0x0000000000cDC1F8d393415455E382c30FBc0a84", // CheckTheChain contract address
    abi: checkTheChainAbi, // CheckTheChain contract abi
    functionName: "batchCheckPrices", // checkPrice function
    args: [tokenList.map((token) => token.address as Address)],
    chainId: 1,
  });

  return (
    <div className="flex flex-col border-2 border-primary gap-2">
      <div className="flex flex-row justify-between items-center bg-primary text-secondary p-1">
        <h1 className="text-lg md:text-xl font-bold">Prices</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetchPrices()}
          disabled={isRefetchingPrices}
          className="hover:cursor-pointer rounded-none"
        >
          {isRefetchingPrices ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCcw className="w-4 h-4" />
          )}
        </Button>
      </div>
      <div className="flex flex-col gap-2 px-4 py-2">
        {tokenList.map((token, index) => (
          <TokenPrice
            key={token.address}
            token={token}
            price={prices?.[1]?.[index] ?? "---"}
            isLoading={isLoadingPrices}
          />
        ))}
      </div>
      <div className="px-4 py-2 flex flex-col items-center border-t-2 border-primary border-dotted">
        <p className="text-sm text-muted-foreground">
          Onchain data from Ethereum
        </p>
      </div>
    </div>
  );
}

function TokenPrice({
  token,
  price,
  isLoading,
}: {
  token: (typeof tokenList)[number];
  price: string;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-row items-center justify-between gap-2">
      <div className="flex flex-row items-center gap-2">
        <p className="hidden lg:inline text-sm">{token.name}</p>
        <p className="text-sm text-muted-foreground">{token.symbol}</p>
      </div>
      {isLoading ? (
        <BuildSkeleton className="w-16 h-6" />
      ) : (
        <p className="text-sm">{formatUsdAmount(price)}</p>
      )}
    </div>
  );
}
