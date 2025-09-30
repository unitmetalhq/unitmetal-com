import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function chainIdToChainName(chainId: number) {
  switch (chainId) {
    case 1:
      return "Ethereum"
    case 137:
      return "Polygon"
    case 42161:
      return "Arbitrum"
    case 8453:
      return "Base"
    case 130:
      return "Unichain"
    case 10:
      return "Optimism"
    case 43114:
      return "Avalanche"
    case 56:
      return "BNB Chain"
    case 324:
      return "ZKSync"
    case 250:
      return "Fantom"
    case 59144:
      return "Linea"
    case 534352:
      return "Scroll"
    case 5000:
      return "Mantle"
    case 81457:
      return "Blast"
    case 146:
      return "Sonic"
    case 80094:
      return "Berachain"
    case 2020:
      return "Ronin"
    default:
      return "Unknown"
  }
}

export function parseUsdAmount(amount: string) {
  // use locale to format the amount
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(amount));
}