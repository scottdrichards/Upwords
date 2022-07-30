module.exports = {
  env: {
    jest: true,
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'linebreak-style': 0,
    'import/extensions': [1, { ts: 'ignorePackages' }],
    'no-console': 'off',
    'no-throw-literal': 'off',
    '@typescript-eslint/indent': [
      'error',
      2,
    ],
    indent: ['error', 2],

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],

    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
  },

  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.js'],
      plugins: ['@typescript-eslint'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
