export default {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true,
      'varsIgnorePattern': '^(type|interface)'
    }],
    '@typescript-eslint/no-explicit-any': 'error'
  }
} 