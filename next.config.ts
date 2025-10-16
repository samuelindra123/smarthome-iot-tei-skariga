// smarthome-dashboard-ts/next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PERBAIKAN: 'allowedDevOrigins' berada di level atas, BUKAN di dalam 'experimental'.
  allowedDevOrigins: [
    // Pastikan URL ini cocok dengan URL di browser kamu (tanpa port :3000)
    "https://3000-firebase-smarthome-iot-1760444149834.cluster-yylgzpipxrar4v4a72liastuqy.cloudworkstations.dev",
  ],
};

export default nextConfig;