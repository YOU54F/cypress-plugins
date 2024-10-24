"use strict";
import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended, // Recommended config applied to all files
    {
        languageOptions: {
            sourceType: "commonjs",
            ecmaVersion: 2015,
            globals: {
                ...globals.node,
                ...globals.mocha,
                ...globals.mocha,
                expect: true,
            },
        },
        ignores: [
            ".editorconfig",
            "artifacts/",
            "coverage/",
            "node_modules/",
            "lcov-*",
            "xunit*",
            "eslint.config.mjs",
        ],
        rules: {
            "brace-style": [2, "stroustrup", { allowSingleLine: true }],
            "no-console": 0,
            strict: [2],
            indent: [2, 4],
            semi: ["error"],
            "prefer-const": ["error"],
            "no-var": ["error"],
            "prefer-destructuring": ["error"],
            "object-shorthand": ["error"],
            quotes: ["error", "single"],
            "quote-props": ["error", "as-needed"],
            "prefer-template": ["error"],
        },
    },
];
