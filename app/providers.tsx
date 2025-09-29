"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { trustWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets";
import { sepolia, baseSepolia, base, arbitrumSepolia, arbitrum } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { ThemeProvider } from "@/components/theme-provider";

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
  appName: "UnitMetal", // Name your app
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, // Enter your WalletConnect Project ID here
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [trustWallet, ledgerWallet],
    },
  ],
  chains: [sepolia, baseSepolia, arbitrumSepolia, base, arbitrum],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA!),
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA!),
    [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA!),
    [base.id]: http(process.env.NEXT_PUBLIC_RPC_URL_BASE!),
    [arbitrum.id]: http(process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM!),
  },
  ssr: true, // Because it is Nextjs's App router, you need to declare ssr as true
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}