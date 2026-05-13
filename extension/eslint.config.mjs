// SPDX-License-Identifier: Apache-2.0
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import babelParser from '@babel/eslint-parser';

export default [
    js.configs.recommended,
    {
        files: ['src/**/*.{js,jsx}'],
        languageOptions: {
            parser: babelParser,
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                requireConfigFile: false,
                ecmaFeatures: { jsx: true },
                babelOptions: {
                    presets: ['@babel/preset-react']
                }
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021
            }
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'jsx-a11y': jsxA11y,
            import: importPlugin
        },
        settings: {
            react: { version: 'detect' },
            'import/resolver': {
                node: { extensions: ['.js', '.jsx'] }
            },
            linkComponents: [
                'Hyperlink',
                { name: 'Link', linkAttribute: 'to' }
            ]
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...jsxA11y.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'error'
        }
    },
    {
        files: ['**/*.test.{js,jsx}', 'test/**/*.{js,jsx}'],
        languageOptions: {
            globals: { ...globals.jest, ...globals.browser, ...globals.node }
        },
        rules: {
            'react/prop-types': 'off'
        }
    },
    {
        ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**']
        // Note: eslint.config.mjs and webpack.config.js, .babelrc, package.json are
        // not in src/ and won't match files: ['src/**/*'] above. They are not linted.
    }
];
