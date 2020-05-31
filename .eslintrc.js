module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    node: true,
  },
  ignorePatterns: ['!/*.js', '/dist/*'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  overrides: [
    {
      files: ['src/scripts/has-content-handlers.js'],
      env: {
        browser: true,
      },
    },
    {
      files: ['src/**/*.ts'],
      extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': ['off'],
      },
    },
  ],
};
