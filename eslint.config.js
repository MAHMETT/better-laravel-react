import tseslint from 'typescript-eslint';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
    // Base ESLint recommended config
    eslint.configs.recommended,

    // TypeScript recommended configs (without strict type checking for performance)
    ...tseslint.configs.recommended,

    // React recommended config
    {
        ...react.configs.flat.recommended,
        ...react.configs.flat['jsx-runtime'],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            'react/jsx-uses-react': 'off',
        },
    },

    // React Hooks config
    reactHooks.configs.flat.recommended,

    // Custom rules and plugins
    {
        plugins: {
            import: importPlugin,
        },
        settings: {
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
                node: true,
            },
        },
        rules: {
            // Allow explicit any types for compatibility
            '@typescript-eslint/no-explicit-any': 'off',

            // Use native TypeScript ESLint deprecation rule
            '@typescript-eslint/no-deprecated': 'warn',

            // Enforce consistent type imports
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],

            // Import style rules
            'import/consistent-type-specifier-style': [
                'error',
                'prefer-top-level',
            ],

            // Performance and best practices (relaxed)
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],

            // React performance rules
            'react-hooks/exhaustive-deps': 'warn',

            // Disable overly strict rules for practical development
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/prefer-nullish-coalescing': 'off',
            '@typescript-eslint/prefer-optional-chain': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unnecessary-condition': 'off',
            '@typescript-eslint/no-confusing-void-expression': 'off',
        },
    },

    // Ignore patterns
    {
        ignores: [
            'vendor',
            'node_modules',
            'public',
            'build',
            'dist',
            'bootstrap/ssr',
            'tailwind.config.js',
            'vite.config.ts',
            'eslint.config.js',
            'resources/js/actions/**',
            'resources/js/components/ui/**',
            'resources/js/routes/**',
            '**/*.d.ts',
            'coverage',
        ],
    },

    // Prettier (must be last to override all other rules)
    prettier,
);
