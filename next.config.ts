import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // ✅ Chỉ giữ 2 package này
  transpilePackages: ["ckeditor5", "@ckeditor/ckeditor5-react"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.ignoreWarnings = [/dropdownRender.*deprecated.*popupRender/i];
    }

    config.module.rules.push({
      test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
      type: "asset/source",
    });

    return config;
  },
};

export default nextConfig;
