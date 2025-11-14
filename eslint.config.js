import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: false,
  ignores: [
    'dist/**',
    'bin/**',
  ],
  rules: {
    'no-console': 'off',
    'ts/no-explicit-any': 'off',
    'perfectionist/sort-named-imports': 'off',
    'perfectionist/sort-imports': 'off',
    'jsonc/sort-keys': 'off',
    'jsonc/sort-array-values': 'off',
    'node/prefer-global/process': 'off',
  },
})
