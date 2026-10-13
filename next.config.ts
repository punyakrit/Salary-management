import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a verification build (NEXT_DIST_DIR=.next-verify pnpm build) run without clobbering a running `next dev`.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
