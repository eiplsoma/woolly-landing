/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
  },
}

let finalConfig = nextConfig

if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = (await import('@next/bundle-analyzer')).default
  finalConfig = withBundleAnalyzer({ enabled: true })(nextConfig)
}

export default finalConfig
