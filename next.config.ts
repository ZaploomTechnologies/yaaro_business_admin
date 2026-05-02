import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** This app’s directory (avoids picking parent lockfile when deployed under yaaro_back/, etc.). */
const outputFileTracingRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* Dev server: allow requests when opening the app via this host (e.g. behind nginx). */
  allowedDevOrigins: ["business.yaaro.fit", "*.yaaro.fit"],
  outputFileTracingRoot,
};

export default nextConfig;
