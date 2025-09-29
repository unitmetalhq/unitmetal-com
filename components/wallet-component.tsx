"use client";

import { useAccount, useBalance, useChainId } from "wagmi";
import { Address, formatUnits } from "viem";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge"

export default function WalletComponent() {
  const { address } = useAccount();
  const chainId = useChainId();

  return (
    <div className="flex flex-col border-2 border-primary gap-2 pb-8">
      <div className="flex flex-row justify-between items-center bg-primary text-secondary p-1">
        <h1 className="text-lg md:text-xl font-bold">Wallet</h1>
      </div>
      <NativeBalanceComponent address={address} chainId={chainId} />
    </div>
  )
}

function NativeBalanceComponent({
  address,
  chainId,
}: {
  address: Address | undefined;
  chainId: number;
}) {
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
    address: address,
    chainId: chainId,
  });

  return (
    <div className="flex flex-row justify-between items-center px-4 py-2">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-2 items-center">
          <h2>Ether</h2>
          {isLoadingBalance ? <Skeleton className="w-10 h-4" /> : <Badge className="rounded-none">{chainId}</Badge>}
        </div>
        <div className="flex flex-row gap-2 items-center">
          <div className="text-muted-foreground">&gt;</div> 
          {isLoadingBalance ? <Skeleton className="w-10 h-4" /> : <div>{formatUnits(balance?.value ?? BigInt(0), 18)} {balance?.symbol}</div>}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <p>$ --</p>
        <p>-- %</p>
      </div>
    </div>
  )
}