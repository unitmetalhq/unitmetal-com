"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { KyberSwap } from "@/lib/build-swap/kyberswap";
import { Fuel } from "lucide-react";
import { ChainIdentifier, GetSwapRouteResponse } from "@/lib/build-swap/types";
import { parseUnits, formatUnits } from "viem";
import { parseUsdAmount } from "@/lib/utils";

const swapSources = [
  {
    name: "Kyberswap",
    rank: 1,
  },
];

export default function SwapSourceComponent({
  chainName,
  tokenIn,
  tokenOut,
  amountIn,
  setAmountOut,
}: {
  chainName: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  setAmountOut: (value: string) => void;
}) {
  const [userSelectedSource, setUserSelectedSource] = useState<string | null>(null);

  const kyberswap = new KyberSwap();
  // Kyberswap quote
  const {
    data: kyberswapQuote,
    isLoading: isKyberswapQuoteLoading,
    isError: isKyberswapQuoteError,
    error: kyberswapQuoteError,
    isRefetching: isKyberswapQuoteRefetching,
    isRefetchError: isKyberswapQuoteRefetchError,
    refetch: refetchKyberswapQuote,
  } = useQuery({ 
    queryKey: ['kyberswap-quote', tokenIn, tokenOut, amountIn], 
    queryFn: () => kyberswap.getSwapRoute({ chainName: chainName.split(":")[1] as ChainIdentifier, tokenIn: tokenIn.split(":")[0], tokenOut: tokenOut.split(":")[0], amountIn: parseUnits(amountIn, parseInt(tokenIn.split(":")[2])).toString() }),
    enabled: !!(tokenIn && tokenOut && amountIn && chainName)
  })

  // Computed selected source: user selection or auto-select rank 1
  const selectedSource = useMemo(() => {
    if (userSelectedSource) return userSelectedSource;
    
    if (kyberswapQuote?.data.routeSummary.amountOut) {
      const rank1Source = swapSources.find(source => source.rank === 1);
      return rank1Source?.name || null;
    }
    
    return null;
  }, [userSelectedSource, kyberswapQuote]);

  // Computed amountOut: calculate when source is auto-selected
  const computedAmountOut = useMemo(() => {
    if (selectedSource && kyberswapQuote?.data.routeSummary.amountOut) {
      return formatUnits(
        BigInt(kyberswapQuote.data.routeSummary.amountOut), 
        parseInt(tokenOut.split(":")[2])
      );
    }
    return "";
  }, [selectedSource, kyberswapQuote, tokenOut]);

  // Update amountOut when computed value changes (only for auto-selection)
  useEffect(() => {
    if (computedAmountOut && !userSelectedSource) {
      setAmountOut(computedAmountOut);
    }
  }, [computedAmountOut, userSelectedSource, setAmountOut]);

  return (
    <div className="flex flex-col border-2 border-primary pb-8 overflow-y-auto h-[400px]">
      <div className="flex flex-row justify-between items-center bg-primary text-secondary p-1">
        <h1 className="text-lg md:text-xl font-bold">Sources</h1>
      </div>
      <div className="flex flex-col gap-2 px-4 py-2">
        <p className="text-sm text-muted-foreground">
          Select a route to perform a swap. Best route is selected based on net
          output after gas fees.
        </p>
      </div>
      {swapSources.map((source) => (
        <SwapSource
          key={source.name}
          name={source.name}
          rank={source.rank}
          tokenOut={tokenOut}
          selectedSource={selectedSource}
          setSelectedSource={setUserSelectedSource}
          setAmountOut={setAmountOut}
          computedAmountOut={computedAmountOut}
          kyberswapQuote={kyberswapQuote}
          isKyberswapQuoteLoading={isKyberswapQuoteLoading}
          isKyberswapQuoteError={isKyberswapQuoteError}
          kyberswapQuoteError={kyberswapQuoteError}
          isKyberswapQuoteRefetching={isKyberswapQuoteRefetching}
          isKyberswapQuoteRefetchError={isKyberswapQuoteRefetchError}
          refetchKyberswapQuote={refetchKyberswapQuote}
        />
      ))}
      <div className="flex flex-col gap-2 px-4 py-2">
        <p className="text-sm text-muted-foreground">
          We are working on adding more aggregators to our platform. Please stay
          tuned.
        </p>
      </div>
    </div>
  );
}

function SwapSource({
  name,
  rank,
  tokenOut,
  selectedSource,
  setSelectedSource,
  setAmountOut,
  computedAmountOut,
  kyberswapQuote,
  isKyberswapQuoteLoading,
  isKyberswapQuoteError,
  kyberswapQuoteError,
  isKyberswapQuoteRefetching,
  isKyberswapQuoteRefetchError,
  refetchKyberswapQuote,
}: {
  name: string;
  rank: number;
  tokenOut: string;
  selectedSource: string | null;
  setSelectedSource: (source: string | null) => void;
  setAmountOut: (value: string) => void;
  computedAmountOut: string;
  kyberswapQuote: GetSwapRouteResponse | undefined;
  isKyberswapQuoteLoading: boolean;
  isKyberswapQuoteError: boolean;
  kyberswapQuoteError: Error | null;
  isKyberswapQuoteRefetching: boolean;
  isKyberswapQuoteRefetchError: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchKyberswapQuote: () => Promise<any>;
}) {
  function handleSelectedSource(name: string) {
    setSelectedSource(selectedSource === name ? null : name);
    
    // Set the amountOut when a source is selected
    if (selectedSource !== name && computedAmountOut) {
      setAmountOut(computedAmountOut);
    }
  }

  return (
    <div
      className={`flex flex-col justify-between items-center px-4 py-2 border-b border-primary w-full hover:cursor-pointer hover:bg-primary hover:text-secondary ${
        selectedSource === name ? "bg-primary text-secondary" : ""
      }`}
      onClick={() => handleSelectedSource(name)}
    >
      <div className="flex flex-row items-start justify-between w-full">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-start gap-2">
            <div className="text-sm">{formatUnits(BigInt(kyberswapQuote?.data.routeSummary.amountOut ?? "0"), parseInt(tokenOut.split(":")[2])).toString()}</div>
            <div className="flex flex-row gap-2">
              <div className="text-sm">(~{parseUsdAmount(kyberswapQuote?.data.routeSummary.amountOutUsd ?? "0")})</div>
              <div className="text-sm text-muted-foreground">{tokenOut.split(":")[1]}</div>
            </div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Fuel className="w-4 h-4" />
            <div className="text-sm">&lt;{kyberswapQuote?.data.routeSummary.gas}</div>
            <div className="text-sm">(~{parseUsdAmount(kyberswapQuote?.data.routeSummary.gasUsd ?? "0")})</div>
          </div>
        </div>
        <div
          className={`border-l-1 border-r-2 border-t-1 border-b-2 px-1 py-0.5 rounded-none ${
            selectedSource === name
              ? "border-secondary text-secondary"
              : "border-primary"
          }`}
        >
          {rank}
        </div>
      </div>
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center place-items-end gap-2">
          <p className="text-sm text-muted-foreground">via</p>
          <p className="text-sm">{name}</p>
        </div>
      </div>
    </div>
  );
}
