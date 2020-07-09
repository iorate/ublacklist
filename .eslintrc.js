module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    node: true,
  },
  ignorePatterns: ['/dist/*'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  overrides: [
    {
      files: ['src/scripts/**/*.js'],
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
        'react/no-unknown-property': [
          'error',
          {
            ignore: ['class', 'for', 'spellcheck'],
          },
        ],
        'react/prop-types': ['off'],
      },
    },
  ],
  settings: {
    react: {
      pragma: 'h',
      version: '16.0',
    },
  },
};
