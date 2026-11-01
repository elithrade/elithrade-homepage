import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const unusedVarsOptions = { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }

const config = [
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-unused-vars': ['error', unusedVarsOptions]
    }
  },
  {
    // In TypeScript the core rule misreports type-only usages; use the
    // typescript-eslint version with the same options instead.
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', unusedVarsOptions]
    }
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'test-results/**',
      'playwright-report/**',
      'blob-report/**',
      'next-env.d.ts'
    ]
  }
]

export default config
