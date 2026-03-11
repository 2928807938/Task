/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // 为Docker部署添加standalone输出模式
    output: 'standalone',
    // 设置环境变量，确保API请求正常
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://task.airaphe.com',
    },
    // 添加API代理配置，解决CORS问题
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.NODE_ENV === 'production'
                    ? process.env.API_URL || 'https://task.airaphe.com/api/:path*'
                    : 'http://localhost:8080/api/:path*',
            },
        ];
    },
    // 确保CSS正确处理和字体文件支持
    webpack: (config) => {
        // 添加对字体文件的支持
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
        
        // 确保对PDF生成库的正确处理
        config.resolve.fallback = {
            ...config.resolve.fallback,
            canvas: false,
            encoding: false,
        };
        
        return config;
    },
    // 指定页面目录路径和扩展名
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
    // 移到顶级的配置项
    outputFileTracingRoot: process.env.NODE_ENV === 'production' ? undefined : process.cwd(),
    serverExternalPackages: [],
};

// 针对开发模式的配置
if (process.env.NODE_ENV !== 'production') {
    nextConfig.devIndicators = {
        position: 'bottom-right',
    };
}

module.exports = nextConfig;
