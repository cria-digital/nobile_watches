/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuração de imagens otimizada
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

    // ✅ Configurações otimizadas de cache e tamanhos
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Qualidades para diferentes casos de uso
    qualities: [75, 85, 90, 95, 100],

    // ✅ Desabilitar otimização automática para SVGs
    unoptimized: false,
  },

  // Otimizações de compilação
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // ✅ Removido experimental.optimizeFonts (automático no Next.js 13+)

  // Headers de segurança
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      // ✅ Headers específicos para fontes
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ✅ Headers específicos para imagens
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Redirects para URLs antigas (se necessário)
  // async redirects() {
  //   return [
  //     {
  //       source: "/relogios",
  //       destination: "/produtos",
  //       permanent: true,
  //     },
  //   ];
  // }
};

module.exports = nextConfig;
