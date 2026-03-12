import typescriptEslint from "@typescript-eslint/eslint-plugin";
import stylisticTs from '@stylistic/eslint-plugin';
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";

const normalize = (cfg) => (Array.isArray(cfg) ? cfg : [cfg]);

const configArray = [
    { ignores: ["views/", "node_modules/"] },

    ...normalize(js.configs.recommended),
    ...normalize(typescriptEslint.configs["flat/eslint-recommended"]),
    ...normalize(typescriptEslint.configs["flat/recommended"]),
    {
        plugins: {
            "@typescript-eslint": typescriptEslint,
            '@stylistic/ts': stylisticTs,
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
                ...globals.mocha,
            },

            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "commonjs",
        },

        rules: {
            "@typescript-eslint/ban-types": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-inferrable-types": "off",

            //TODO: These linting rule bypasses need removing and fixing
            // significant effort required
            "@typescript-eslint/no-unused-vars": "off",
            "no-underscore-dangle": "off",

            semi: ["error", "always"],
            "@stylistic/ts/type-annotation-spacing": "error",
            "arrow-spacing": "error",

            "brace-style": [
                "error",
                "1tbs",
                {
                    allowSingleLine: true,
                },
            ],

            "comma-spacing": [
                "error",
                {
                    before: false,
                    after: true,
                },
            ],

            curly: "error",
            eqeqeq: "error",
            "eol-last": ["warn", "always"],

            indent: [
                "error",
                4,
                {
                    FunctionExpression: {
                        parameters: "first",
                    },

                    CallExpression: {
                        arguments: "first",
                    },

                    outerIIFEBody: 2,
                    SwitchCase: 2,
                    offsetTernaryExpressions: true,
                },
            ],

            "key-spacing": [
                "error",
                {
                    afterColon: true,
                },
            ],

            "keyword-spacing": [
                "error",
                {
                    before: true,
                    after: true,
                },
            ],

            "no-duplicate-imports": "error",
            "no-irregular-whitespace": "error",
            "no-trailing-spaces": "error",
            "no-multi-spaces": "error",
            "no-unused-vars": "off",
            "no-whitespace-before-property": "error",
            "object-curly-spacing": ["error", "always"],
            "space-infix-ops": "error",

            "spaced-comment": [
                "error",
                "always",
                {
                    markers: ["/", "*"],
                },
            ],

            "quotes": ["error", "double", { allowTemplateLiterals: true }],
        },
    },
    {
        files: ["**/*.test.ts"],
        rules: {
            "no-unused-expressions": "off",
            "@typescript-eslint/no-unused-expressions": "off",
        },
    },
];

export default configArray;