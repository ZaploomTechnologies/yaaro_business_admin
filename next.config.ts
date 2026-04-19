import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Dev server: allow requests when opening the app via this host (e.g. behind nginx). */
  allowedDevOrigins: ["business.yaaro.fit", "*.yaaro.fit"],
};

export default nextConfig;
