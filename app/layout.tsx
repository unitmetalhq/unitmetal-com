import Script from 'next/script';
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import SiteHeader from "@/components/site-header";
import Footer from "@/components/footer";

const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'UnitMetal',
  description: 'Professional interface for the future of finance',
  metadataBase: new URL('https://www.unitmetal.com'),
  openGraph: {
    title: 'UnitMetal',
    description: 'Professional interface for the future of finance',
    url: 'https://www.unitmetal.com',
    siteName: 'UnitMetal',
    images: [
      {
        url: '/unitmetal-tbn.png',
        width: 1200,
        height: 630,
        alt: 'og-image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UnitMetal',
    description: 'Professional interface for the future of finance',
    creator: '@unitmetalHQ',
    images: ['/unitmetal-tbn.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script
        defer
        src="https://analytics.zxstim.com/script.js"
        data-website-id="4c5f4181-315b-416b-9e01-99d2f80e822b"
      />
      <body
        className={jetBrainsMono.className}
      >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="flex flex-col gap-12 items-center p-6 md:p-10 pb-12">
              <SiteHeader />
              {children}
              <Footer />
            </main>
          </ThemeProvider>
      </body>
    </html>
  );
}
