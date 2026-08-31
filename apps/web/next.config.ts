import type { NextConfig } from "next";

/**
 * Next.js configuration for GCC Portal web app.
 *
 * Deployment target: Cloudflare Pages (via @cloudflare/next-on-pages or vinext).
 * Deployment tooling is configured separately and NOT applied here yet.
 * See docs/ARCHITECTURE.md for the deployment topology.
 */
const nextConfig: NextConfig = {
  // Strict React mode for surfacing potential issues early
  reactStrictMode: true,

  // Output the build in a way compatible with Cloudflare Pages edge runtime.
  // Switch to "export" only if a fully-static build is needed.
  // output: "export",

  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
