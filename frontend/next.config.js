/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },

  // Configuração de imagens
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
        hostname: "images.unsplash.com", // Imagens placeholder durante desenvolvimento
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Cloudinary para imagens de produção
      },
    ],
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",

   qualities: [75, 85, 90, 95, 100],
  },

  // Otimizações
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

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
  // },'
};

module.exports = nextConfig;
