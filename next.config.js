/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gutenberg.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'standardebooks.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'manybooks.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
