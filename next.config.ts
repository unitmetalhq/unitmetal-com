import type { NextConfig } from "next";


/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  turbopack: {
    rules: {
      '*.node': {
        loaders: ['external-loader'],
      },
    },
    resolveAlias: {
      'pino-pretty': '',
      'lokijs': '',
      'encoding': '',
    },
  }
};

export default nextConfig;