"use client";

import { useState } from "react";
import { Fuel } from "lucide-react";

const swapSources = [
  {
    name: "Kyberswap",
    rank: 1,
  },
  {
    name: "1Inch",
    rank: 2,
  },
  {
    name: "Uniswap",
    rank: 3,
  },
  {
    name: "SushiSwap",
    rank: 4,
  },
  {
    name: "PancakeSwap",
    rank: 5,
  },
  {
    name: "Curve",
    rank: 7,
  },
  {
    name: "Balancer",
    rank: 8,
  },
];

export default function SwapSourceComponent() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  return (
    <div className="flex flex-col border-2 border-primary pb-8 overflow-y-auto h-[400px]">
      <div className="flex flex-row justify-between items-center bg-primary text-secondary p-1">
        <h1 className="text-lg md:text-xl font-bold">Sources</h1>
      </div>
      <div className="flex flex-col gap-2 px-4 py-2">
        <p className="text-sm">Select a route to perform a swap. Best route is selected based on net output after gas fees.</p>
      </div>

      {swapSources.map((source) => (
        <SwapSource
          key={source.name}
          name={source.name}
          rank={source.rank}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
        />
      ))}
    </div>
  );
}

function SwapSource({
  name,
  rank,
  selectedSource,
  setSelectedSource,
}: {
  name: string;
  rank: number;
  selectedSource: string | null;
  setSelectedSource: (source: string | null) => void;
}) {
  return (
    <div
      className={`flex flex-col justify-between items-center px-4 py-2 border-b border-primary w-full hover:cursor-pointer hover:bg-primary hover:text-secondary ${
        selectedSource === name ? "bg-primary text-secondary" : ""
      }`}
      onClick={() => setSelectedSource(name)}
    >
      <div className="flex flex-row items-start justify-between w-full">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center gap-2">
            <div>1000.020203</div>
            <div className="text-muted-foreground">USDC</div>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Fuel className="w-4 h-4" />
            <div>&lt;$0.01</div>
            <div>≈</div>
          </div>
        </div>
        <div className="underline underline-offset-4">
          {rank === 1 ? "Best" : rank}
        </div>
      </div>
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-row items-center place-items-end gap-2">
          <p className="text-muted-foreground">via</p>
          <p>{name}</p>
        </div>
      </div>
    </div>
  );
}
