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
    domains: [
      'trulybot.xyz', 
      'www.trulybot.xyz',
      'ilcydjngyatddefgdjpg.supabase.co' // Supabase storage domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: 'default',
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers for performance and security
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
    // Widget and embeddable routes - allow embedding
    {
      source: '/embed(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://va.vercel-scripts.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://accounts.google.com https://va.vercel-scripts.com https://api.razorpay.com https://checkout.razorpay.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; frame-ancestors *;",
        },
      ],
    },
    // Widget page route - allow embedding
    {
      source: '/widget(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://va.vercel-scripts.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://accounts.google.com https://va.vercel-scripts.com https://api.razorpay.com https://checkout.razorpay.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com; frame-ancestors *;",
        },
      ],
    },
    // Widget JavaScript file - allow cross-origin loading
    {
      source: '/widget.js',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type',
        },
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600',
        },
      ],
    },
    // Widget loader JavaScript - allow cross-origin loading
    {
      source: '/widget/loader.js',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type',
        },
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600',
        },
      ],
    },
    // Widget config API - allow cross-origin requests
    {
      source: '/api/widget/(.*)',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: '*',
        },
        {
          key: 'Access-Control-Allow-Methods',
          value: 'GET, OPTIONS',
        },
        {
          key: 'Access-Control-Allow-Headers',
          value: 'Content-Type',
        },
        {
          key: 'Cache-Control',
          value: 'no-cache, no-store, must-revalidate',
        },
      ],
    },
    // All other routes except embeddable ones - strict security
    {
      source: '/((?!embed|widget).*)',
      headers: [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://va.vercel-scripts.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://accounts.google.com https://va.vercel-scripts.com https://api.razorpay.com https://checkout.razorpay.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;",
        },
      ],
    },
  ],

  // Webpack optimizations
  webpack(config, { dev }) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    config.resolve.alias['@lib'] = path.resolve(__dirname, 'src/lib');

    // Add SVG loader configuration
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

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
