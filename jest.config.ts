import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@cedarwood/checkout-sdk$': '<rootDir>/packages/checkout-sdk/src',
    '^@cedarwood/pos-terminal$': '<rootDir>/packages/pos-terminal/src',
    '^sanityClient$': '<rootDir>/__mocks__/sanityClient.ts',
  },
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/.next/'],
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'jest-environment-node',
      testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jest-environment-jsdom',
      testMatch: ['<rootDir>/__tests__/**/*.test.tsx'],
    },
  ],
  collectCoverageFrom: ['lib/**/*.ts', 'components/**/*.tsx', '!**/*.d.ts'],
  coverageThreshold: {
    global: { branches: 60, functions: 65, lines: 70, statements: 70 },
  },
}

export default createJestConfig(config)
