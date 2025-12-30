/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove deprecated experimental.appDir option
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
