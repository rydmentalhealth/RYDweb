/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'child_process', etc. on the client side
      config.resolve.fallback = {
        fs: false,
        child_process: false,
        net: false,
        tls: false,
        dns: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  images: {
    domains: ['images.unsplash.com', 'www.google.com', 'www.restoredignity.org', 'hips.hearstapps.com', 'elements-resized.envatousercontent.com', 'images.squarespace-cdn.com', 'media.istockphoto.com'],
  },
}

module.exports = nextConfig 