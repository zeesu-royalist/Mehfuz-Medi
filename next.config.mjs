/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "localhost",
        "127.0.0.1"
      ]
    },
  },
};

export default nextConfig;
