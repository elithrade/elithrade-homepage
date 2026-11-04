import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Stop `next dev` writing AGENTS.md whenever an AI coding agent starts it.
  agentRules: false
}

export default nextConfig
