module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  globals: {
    window: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-inner-declarations': ['off'],
    'require-atomic-updates': ['off'],
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'error',
      {
        allowExpressions: true,
      },
    ],
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'no-public',
      },
    ],
    '@typescript-eslint/no-inferrable-types': ['off'],
    '@typescript-eslint/no-namespace': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        functions: false,
      },
    ],
  },
};
