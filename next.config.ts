import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
  },
  // The Studio (sanity/@sanity/vision) is client-only and incompatible with Next's
  // "react-server" bundling condition (e.g. swr's default export) when reached from a
  // Server Component — load it via Node's require() instead of bundling it.
  serverExternalPackages: ["sanity", "@sanity/vision"],
};

export default nextConfig;
