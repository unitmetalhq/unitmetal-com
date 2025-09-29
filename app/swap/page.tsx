import SwapComponent from "@/components/swap-component";
import SwapSourceComponent from "@/components/swap-source-component";
import TransactionStatusComponent from "@/components/transaction-status-component";
import WalletComponent from "@/components/wallet-component";

export default function SwapPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      <SwapComponent />
      <div className="flex flex-col gap-4">
        <SwapSourceComponent />
        <TransactionStatusComponent />
      </div>
      <WalletComponent />
    </div>
  )
}