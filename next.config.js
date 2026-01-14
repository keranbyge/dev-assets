/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dinklbvkwxvvtlgtkwv.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
};

module.exports = nextConfig;
