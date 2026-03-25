import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Config nettoyée pour Next 16.2.0 stable
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
