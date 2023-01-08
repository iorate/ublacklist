// @ts-check

/** @type { import('eslint').Linter.Config } */
const config = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: ['/.yarn', '/dist'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: { attributes: false } },
        ],
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['src/scripts/*.js'],
      env: {
        browser: true,
        es2019: true,
        es2021: false,
        node: false,
      },
    },
  ],
  plugins: ['import', 'unused-imports'],
  reportUnusedDisableDirectives: true,
  root: true,
  rules: {
    'object-shorthand': 'warn',
    'sort-imports': ['warn', { ignoreDeclarationSort: true }],
    'import/order': ['warn', { alphabetize: { order: 'asc' } }],
    'react/jsx-sort-props': ['warn', { callbacksLast: true }],
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': ['warn', { additionalHooks: 'useClassName' }],
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': 'warn',
  },
  settings: {
    react: {
      version: '17.0',
    },
  },
};

module.exports = config;
