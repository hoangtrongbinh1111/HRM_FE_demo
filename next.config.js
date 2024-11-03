const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async redirects() {
        return [
            {
                source: '/',
                // destination: '/sign-in',
                destination: '/hrm/dashboard',
                permanent: true,
            },

        ]
    },
    sassOptions: {
        includePaths: [path.join(__dirname, 'assets/styles')],
    },
    compiler: {
        removeConsole: false,
    },
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    swcMinify: true
}

module.exports = nextConfig

