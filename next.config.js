/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Le typage passe désormais : on ne masque plus les erreurs TS.
  eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
