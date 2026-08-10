import js from '@eslint/js'
import next from 'eslint-config-next'
import prettier from 'eslint-plugin-prettier'

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'packages/*/dist/**', 'schema.prisma'],
  },
  js.configs.recommended,
  ...next,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { prettier },
    rules: {
      'prettier/prettier': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/order': [
        'error',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'react/jsx-no-target-blank': 'error',
      'react/self-closing-comp': 'error',
    },
  },
  {
    files: ['__tests__/**/*.{ts,tsx}', 'e2e/**/*.ts'],
    rules: { 'no-console': 'off' },
  },
]
