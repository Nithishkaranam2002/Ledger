import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid picking a parent lockfile when the workspace path is nested
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
