import '@testing-library/jest-dom'

process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= 'test-project'
process.env.NEXT_PUBLIC_SANITY_DATASET ??= 'test'
process.env.NEXT_PUBLIC_SANITY_API_VERSION ??= '2026-01-15'
process.env.NEXTAUTH_SECRET ??= 'test-secret-not-used-in-production'
process.env.CHECKOUT_ENVIRONMENT ??= 'sandbox'

// The App Router navigation hooks are not available under jest; stub the surface
// our components actually touch.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  notFound: jest.fn(),
}))

// sharp is a native module; nothing in the unit suite needs real encoding.
jest.mock('sharp', () => {
  const chain = {
    resize: () => chain,
    webp: () => chain,
    avif: () => chain,
    toBuffer: async () => Buffer.from('stub-image'),
    metadata: async () => ({ width: 1200, height: 630, format: 'webp' }),
  }
  return () => chain
})

afterEach(() => {
  jest.clearAllMocks()
})
