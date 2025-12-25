/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Performance optimizations
    compress: true,
    poweredByHeader: false,

    // Experimental features for better performance
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
    },
};

module.exports = nextConfig;
