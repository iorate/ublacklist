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
      files: ['src/**/*.js'],
      env: {
        browser: true,
      },
    },
    {
      files: ['src/**/*.{ts,tsx}'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier/@typescript-eslint',
        'prettier/react',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      plugins: ['@typescript-eslint'],
      rules: {
        'react/prop-types': ['off'],
        '@typescript-eslint/no-non-null-assertion': ['off'],
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
