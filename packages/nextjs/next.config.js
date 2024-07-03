// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  images: {
    remotePatterns: [
      {
        hostname: "api.multiavatar.com",
      },
      {
        hostname: "assets.poap.xyz",
      },
      {
        hostname: "storage.googleapis.com",
      },
      { hostname: "ipfs.internal.citizenwallet.xyz" },
    ],
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: false,
            titleProp: true,
            ref: true,
          },
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
