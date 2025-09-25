const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        'Express': false,
        'BufferEncoding': false,
      }
    }
  },
  {
    ignores: ['eslint.config.js'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  eslintPluginPrettierRecommended,
  {
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'warn',
      "no-undef": "error",
      "no-global-assign": "error",
      "no-new-object": "error",
      'max-len': ['warn', 120, 2],
    },
  },
);
