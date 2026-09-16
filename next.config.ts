import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O indicador de desenvolvimento cobre o canto inferior esquerdo e atrapalha
  // a inspeção visual das telas.
  devIndicators: false,
  poweredByHeader: false,
};

export default nextConfig;
