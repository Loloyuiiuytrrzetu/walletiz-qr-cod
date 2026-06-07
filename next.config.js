/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/maquette/index.html" },
      ],
    };
  },
};
module.exports = nextConfig;
