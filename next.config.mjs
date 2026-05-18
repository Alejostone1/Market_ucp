/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Exclude socket.io (server-only, uses native binaries) from serverless bundle
  serverExternalPackages: ['socket.io', 'socket.io-adapter', 'engine.io', 'ws', 'uws'],
  // Prevent socket.io native files from being traced into the serverless output
  outputFileTracingExcludes: {
    '*': [
      '**/node_modules/socket.io/**',
      '**/node_modules/socket.io-adapter/**',
      '**/node_modules/engine.io/**',
      '**/node_modules/uws/**',
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
      };
    }
    // Prevent socket.io (server-only) from being bundled by webpack
    if (isServer) {
      config.externals = [...(config.externals || []), 'socket.io', 'engine.io', 'uws'];
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
