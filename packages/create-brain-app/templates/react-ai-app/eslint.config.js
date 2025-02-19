import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from './.prettierrc.js';
import prettier from 'eslint-plugin-prettier';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import * as feDev from '@qlover/eslint-plugin-fe-dev';
import vitestPlugin from 'eslint-plugin-vitest';
import importPlugin from 'eslint-plugin-import';

const noBrowserTpl = '浏览器环境没有全局变量: `${name}`';
const noNodeTpl = 'Node.js 环境没有全局变量: `${name}`';
/**
 * 全局变量规则
 * @param {*} allGlobals
 * @param {*} allowedGlobals
 * @returns
 */
function globalsRules(allGlobals, allowedGlobals, noBrowserTpl) {
  // 获取所有全局变量
  const allGlobalKeys = new Set([...Object.keys(allGlobals)]);
  // 获取不允许的全局变量
  const notAllowedGlobals = Array.from(allGlobalKeys)
    .filter((key) => {
      return !(key in allowedGlobals) || allowedGlobals[key] == null;
    })
    .map((name) => ({
      name,
      message: noBrowserTpl.replace('${name}', name)
    }));

  return {
    'no-restricted-globals': ['error', ...notAllowedGlobals]
  };
}

// 定义整个项目允许的全局变量
const allowedGlobals = {
  ...globals.browser,
  ...globals.node,
  ...globals.jest
};

export default [
  importPlugin.flatConfigs.recommended,
  { ignores: ['dist', 'node_modules', 'src/__mocks__', 'src/__tests__'] },
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        SpeechRecognition: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
      '@typescript-eslint': tseslint,
      'fe-dev': feDev
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      // 不允许出现浏览器环境没有的变量
      ...globalsRules(allowedGlobals, globals.browser, noBrowserTpl),
      'react/jsx-no-target-blank': 'off',
      'react/prefer-stateless-function': 'error',
      'react-refresh/only-export-components': [
        'warn',
        // 允许在 tsx 导出常量
        { allowConstantExport: true }
      ],
      // 不允许使用 any
      '@typescript-eslint/no-explicit-any': 'error',
      // 使用 prettier 格式化校验
      'prettier/prettier': ['error', prettierConfig],
      // 配置 @ts-expect-error 注释规则
      '@typescript-eslint/ban-ts-comment': [
        'off',
        {
          'ts-expect-error': {
            descriptionFormat: '^.*$' // 允许任意长度的描述，包括空描述
          }
        }
      ],

      // 关闭 hook 的依赖项规则，根据实际情况自己判断
      'react-hooks/exhaustive-deps': 'off',
      // class 的每个方法必须写返回类型
      'fe-dev/ts-class-method-return': 'error',
      // 禁用export default
      'import/no-default-export': 'error',
      // 禁用 import/no-unresolved 检查
      'import/no-unresolved': 'off',
      // 禁用 import/named 检查
      'import/named': 'off'
    }
  },
  {
    files: ['src/**/__tests__/**/*.test.{ts,tsx}'],
    plugins: {
      vitest: vitestPlugin
    },
    languageOptions: {
      parser: tsparser,
      // 支持 React 组件测试, 允许有 document 这些引用
      globals: {
        ...allowedGlobals,
        ...vitestPlugin.environments.env.globals
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json'
      }
    },
    rules: {
      ...vitestPlugin.configs.recommended.rules,
      'no-restricted-globals': 'off'
    }
  }
];
