module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    node: true,
  },
  ignorePatterns: ['/dist/*'],
  parserOptions: {
    ecmaVersion: 2019,
  },
  overrides: [
    {
      files: ['src/scripts/**/*.js'],
      env: {
        browser: true,
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier/@typescript-eslint',
        'prettier/react',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
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
