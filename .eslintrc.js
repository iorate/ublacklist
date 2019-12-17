module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
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
    '@typescript-eslint/no-empty-interface': ['off'],
    '@typescript-eslint/no-inferrable-types': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],
    '@typescript-eslint/no-object-literal-type-assertion': ['off'],
  },
};
