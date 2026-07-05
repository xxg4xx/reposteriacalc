import js from '@eslint/js'

export default [
  js.configs.recommended,

  // Shared rules for all JS files
  {
    files: ['**/*.js', '**/*.mjs'],
    rules: {
      semi: ['error', 'never'],
      indent: ['error', 2],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // ESM browser files (app.js)
  {
    files: ['app.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        caches: 'readonly',
        self: 'readonly',
        confirm: 'readonly',
        URLSearchParams: 'readonly',
        Response: 'readonly',
      },
    },
  },

  // Service Worker (sw.js)
  {
    files: ['sw.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        self: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        caches: 'readonly',
        Response: 'readonly',
        addEventListener: 'readonly',
      },
    },
  },

  // Node.js CommonJS (server.js)
  {
    files: ['server.js'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 'latest',
      globals: {
        require: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
  },

  // ESM source modules and tests
  {
    files: ['src/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        console: 'readonly',
        global: 'readonly',
        document: 'readonly',
        vi: 'readonly',
      },
    },
  },

  // Config files
  {
    files: ['eslint.config.mjs', 'vitest.config.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
    },
  },

  // Global ignores
  {
    ignores: ['node_modules/', 'openspec/', '.atl/'],
  },
]
