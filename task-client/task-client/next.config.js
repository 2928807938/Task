/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NODE_ENV === 'production' || process.env.STATIC_EXPORT === '1';

const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    output: isStaticExport ? 'export' : 'standalone',
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    },
    images: {
        unoptimized: isStaticExport,
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(woff|woff2|eot|ttf|otf)$/,
            use: {
                loader: 'file-loader',
                options: {
                    publicPath: '/_next/static/fonts/',
                    outputPath: 'static/fonts/',
                },
            },
        });

        config.resolve.fallback = {
            ...config.resolve.fallback,
            canvas: false,
            encoding: false,
        };

        return config;
    },
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    outputFileTracingRoot: isStaticExport ? undefined : process.cwd(),
    serverExternalPackages: [],
};

if (!isStaticExport) {
    nextConfig.rewrites = async () => [
        {
            source: '/api/:path*',
            destination: process.env.NODE_ENV === 'production'
                ? process.env.API_URL || 'https://task.airaphe.com/api/:path*'
                : 'http://localhost:8080/api/:path*',
        },
    ];
}

if (!isStaticExport && process.env.NODE_ENV !== 'production') {
    nextConfig.devIndicators = {
        position: 'bottom-right',
    };
}

module.exports = nextConfig;
