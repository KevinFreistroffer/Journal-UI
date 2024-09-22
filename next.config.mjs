/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["http://localhost:3000", "http://localhost:3001"],
    },
  },
};

export default nextConfig;
