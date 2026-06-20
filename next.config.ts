import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // In development, you can temporarily uncomment the line below to skip TS checks:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
