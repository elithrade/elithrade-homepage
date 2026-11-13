import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Stop `next dev` writing AGENTS.md whenever an AI coding agent starts it.
  agentRules: false,
  async headers() {
    return [
      {
        // The home page is regenerated in the background (ISR), and for such
        // pages Next sends `s-maxage=…, stale-while-revalidate=<a year>`.
        // That header is meant for a CDN, but Azure Static Web Apps passes it
        // on to the browser, and Firefox obeys it: on a later visit it shows
        // its stored copy of the HTML and only checks for a new one
        // afterwards. After a deployment that copy names script files of the
        // previous build, which are gone, so React never starts and the page
        // stays empty under the navbar until a reload. Make browsers check
        // with the server on every visit. Next's own cache is unaffected, so
        // the page is still served from it and regenerated as before.
        source: '/',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }
        ]
      }
    ]
  }
}

export default nextConfig
