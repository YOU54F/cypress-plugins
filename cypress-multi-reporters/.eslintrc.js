'use strict';

module.exports = {
    extends: 'eslint:recommended',
    env: {
        node: true
    },
    parserOptions: {
        ecmaVersion: 2015
    },
    rules: {
        'brace-style': [2, 'stroustrup', {allowSingleLine: true}],
        'no-console': 0,
        strict: [2],
        indent: [2, 4],

        semi: ['error'],
        'prefer-const': ['error'],
        'no-var': ['error'],
        'prefer-destructuring': ['error'],
        'object-shorthand': ['error'],
        quotes: ['error', 'single'],
        'quote-props': ['error', 'as-needed'],
        'prefer-template': ['error']
    },
    overrides: [
        {
            files: 'tests/**',
            env: {
                mocha: true
            },
            globals: {
                expect: true
            }
        }
    ]
};
