const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Experimental features
  experimental: {
    // Disabled optimizeCss due to critters dependency issue
    // optimizeCss: true,
    serverComponentsExternalPackages: ['ioredis', 'redis'],
  },

  // Image optimization
  images: {
    domains: ['trulybot.xyz', 'www.trulybot.xyz'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
  },

  // Headers for performance
  headers: async () => [
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/api/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
      ],
    },
  ],

  // Webpack optimizations
  webpack(config, { dev }) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    config.resolve.alias['@lib'] = path.resolve(__dirname, 'src/lib');

    // Production optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // PoweredByHeader
  poweredByHeader: false,

  // Compression
  compress: true,
};
