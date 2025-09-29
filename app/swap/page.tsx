import SwapComponent from "@/components/swap-component";
import WalletComponent from "@/components/wallet-component";

export default function SwapPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      <SwapComponent />
      <WalletComponent />
    </div>
  )
}