import { dirname } from 'node:path'

import jsPlugin from '@eslint/js'
import stylisticPlugin from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
// @ts-expect-error TS7016
import reExportSortPlugin from 'eslint-plugin-re-export-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import globals from 'globals'
import * as tseslint from 'typescript-eslint'

// eslint-disable-next-line no-restricted-syntax
export default tseslint.config([
  jsPlugin.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  stylisticPlugin.configs.customize({ severity: 'warn' }),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: dirname(import.meta.dirname),
      },
    },
    plugins: {
      '@unused-imports': unusedImports,
      're-export-sort': reExportSortPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      'curly': ['warn'],
      'no-console': ['warn'],
      'no-eval': ['warn'],
      'no-implied-eval': ['warn'],
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Usage of default exports is discouraged',
        },
        {
          selector: "NewExpression[callee.name='Error']",
          message: 'Please subclass CoolError instead of using the built-it Error class',
        },
        {
          selector: "*[accessibility='private']",
          message: 'Consider using JavaScript private identifiers instead',
        },
      ],
      'no-unused-vars': ['off'], // Superseded by the @unused-imports rule below
      'import/order': [
        'warn',
        {
          'named': true,
          'alphabetize': { order: 'asc' },
          'newlines-between': 'always',
          'groups': ['builtin', 'external', 'internal'],
        },
      ],
      'import/extensions': ['error', 'always'],
      'import/consistent-type-specifier-style': ['warn', 'prefer-inline'],
      're-export-sort/exports': ['warn'],
      '@unused-imports/no-unused-imports': ['warn'],
      '@unused-imports/no-unused-vars': ['warn', { vars: 'all', args: 'after-used', argsIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/unbound-method': ['off'],
      '@typescript-eslint/require-await': ['off'],
      '@typescript-eslint/ban-ts-comment': ['off'],
      '@typescript-eslint/no-unsafe-argument': ['off'],
      '@typescript-eslint/no-unsafe-unary-minus': ['off'],
      '@typescript-eslint/no-unsafe-assignment': ['off'],
      '@typescript-eslint/no-unsafe-return': ['off'],
      '@typescript-eslint/no-unsafe-call': ['off'],
      '@typescript-eslint/no-unsafe-member-access': ['off'],
      '@typescript-eslint/restrict-template-expressions': ['off'],
      '@typescript-eslint/prefer-promise-reject-errors': ['off'],
      '@typescript-eslint/no-restricted-types': [
        'warn', {
          types: {
            number: {
              message: 'Prefer using uint32, int32 or float64',
            },
          },
        },
      ],
      '@typescript-eslint/no-floating-promises': [
        'warn',
        {
          allowForKnownSafeCalls: [
            // @types/node seemed to have some oddities, regarding these names,
            // which I found out about by monkey patching @typescript-eslint and logging.
            // In case of future need, the following files can be patched:
            // node_modules/@typescript-eslint/type-utils/dist/typeOrValueSpecifiers/specifierNameMatches.js
            // node_modules/@typescript-eslint/type-utils/dist/typeOrValueSpecifiers/typeDeclaredInPackageDeclarationFile.js
            { from: 'package', package: 'node:test', name: ['describe', 'it'] },
          ],
        },
      ],
      '@stylistic/brace-style': ['warn', '1tbs'],
      '@stylistic/quotes': ['warn', 'single', { avoidEscape: true }],
      '@stylistic/arrow-parens': ['warn', 'as-needed'],
      '@stylistic/operator-linebreak': ['warn', 'after'],
    },
  },

  {
    files: ['build/**/*.ts', 'server/**/*.ts', 'e2e/**/*.ts', 'benchmarks/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
])
