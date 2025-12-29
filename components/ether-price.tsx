"use client";
import { useReadContract } from "wagmi";
import { checkTheChainAbi } from "@/lib/abis/CheckTheChain";
import { BuildSkeleton } from "@/components/build-ui/build-skeleton";
import { parseUsdAmount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Loader2 } from "lucide-react";

export default function EtherPrice() {
  const {
    data: price,
    isLoading: isLoadingPrice,
    refetch: refetchPrice,
    isRefetching: isRefetchingPrice,
  } = useReadContract({
    address: "0x0000000000cDC1F8d393415455E382c30FBc0a84", // CheckTheChain contract address
    abi: checkTheChainAbi, // CheckTheChain contract abi
    functionName: "checkPrice", // checkPrice function
    args: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"], // WETH address
    chainId: 1,
  });

  return (
    <div className="flex flex-col border-2 border-primary gap-2 pb-8">
      <div className="flex flex-row justify-between items-center bg-primary text-secondary p-1">
        <h1 className="text-lg md:text-xl font-bold">ETH</h1>
      </div>
      <div className="flex flex-row justify-between items-center gap-2 px-4 py-2">
        {isLoadingPrice ? (
          <BuildSkeleton className="w-16 h-6" />
        ) : (
          <div className="flex flex-row items-end gap-2">
            <p className="text-3xl">{parseUsdAmount(price?.[1] ?? "0")}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetchPrice()}
          disabled={isRefetchingPrice}
          className="hover:cursor-pointer rounded-none"
        >
          {isRefetchingPrice ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCcw className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
