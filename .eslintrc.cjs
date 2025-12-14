module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    mocha: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  ignorePatterns: ['*.generated.js', 'src/**/*.d.ts'],
  rules: {
    // Relaxed rules during TypeScript migration
    'prefer-spread': 'off',
    'prefer-rest-params': 'off',
    'no-constant-condition': 'off',
    'no-empty': 'off'
  },
  overrides: [
    {
      files: ['*.js', '*.cjs', '*.mjs'],
      extends: [
        'standard'
      ]
    },
    {
      files: ['*.test.js'],
      plugins: ['mocha'],
      extends: [
        'standard',
        'plugin:mocha/recommended'
      ],
      rules: {
        'mocha/no-skipped-tests': 'error',
        'mocha/no-exclusive-tests': 'error',
        'mocha/no-setup-in-describe': 'off',
        'mocha/no-identical-title': 'off' // TODO: Remove this
      }
    },
    {
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended' // this should come last
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true
          }
        ],
        // Relaxed rules for TypeScript migration period (53% converted)
        // TODO: Re-enable these rules as migration progresses
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/prefer-as-const': 'warn',
        '@typescript-eslint/no-misused-new': 'off',
        'prefer-spread': 'off',
        'prefer-rest-params': 'off',
        'no-constant-condition': 'off',
        'no-empty': 'off'
      },
      plugins: ['@typescript-eslint'],
      parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
        project: 'tsconfig.json'
      }
    }
  ]
}
