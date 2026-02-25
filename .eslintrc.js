module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'react-app',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-unnecessary-type-constraint': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
