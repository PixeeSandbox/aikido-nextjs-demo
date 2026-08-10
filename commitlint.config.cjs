module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['app', 'shop', 'tickets', 'checkout', 'studio', 'schema', 'deps', 'ci', 'docs', 'pos'],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case']],
    'body-max-line-length': [1, 'always', 100],
  },
}
