import EtherPrice from "@/components/ether-price";
import TradingViewWidget from "@/components/tradingview-widget";

export default function EthPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      <EtherPrice />
      <div className="lg:col-span-2">
        <TradingViewWidget />
      </div>
    </div>
  )
}