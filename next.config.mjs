/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // mysql2 and mongodb are server-only; keep them out of the bundler.
  experimental: { serverComponentsExternalPackages: ["mysql2", "mongodb"] },
};
export default nextConfig;
