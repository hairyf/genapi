# API Pipeline Generator

> [English](./README.md) | 中文

API管道生成器，用于将OpenApi（v2~v3）和其他输入源转换为TS/JS API，目前支持 axios 模板。

## ⚙️ Install

在项目文件夹中本地安装：

```bash
pnpm add apipgen --dev
# Or Yarn
yarn add apipgen --dev
```

> 您也可以全局安装，但不建议这样做。

## 📖 Usage

当前未提供CLI选项，输出内容由配置文件确定。目前支持以下配置文件：

- `api-generator.config.ts`
- `api-generator.config.js`
- `api-generator.config.cjs`
- `api-generator.config.json`

```ts
import { defineConfig } from 'ptsup'

export default defineConfig({
  // 输入源(swagger url 或 swagger json)以及输出源
  // 如果有多个源，可以使用 server 字段
  input: 'http://...api-docs',
  output: {
    main: 'src/api/index.ts',
    type: 'src/api/index.type.ts',
  },

  // API baseUrl，此配置将传递给 axios
  baseURL: 'import.meta.env.VITE_APP_BASE_API',
  // 自定义 responseType，默认 T
  responseType: 'T extends { data?: infer V } ? V : void',
})
```

```sh
# run apipgen
apipgen
```

![cli-case](public/case.gif)

## Input


input 目前支持三个输入源 `url|json|test`

```ts
export default defineConfig({
  // 直接输入 swagger url
  input: 'http://...api-docs',
  // 或者选择其他源
  input: { /* url|json|test */ }
})
```

## Server

如果有多个服务。您可以使用 `server` 设置多个服务。顶层的其他配置被用作附加配置。

```ts
export default defineConfig({
  baseUrl: 'https://...',
  // 所有 server 都继承上层配置
  server: [
    { import: '...', output: {/* ... */} },
    { import: '...', output: {/* ... */} },
    { import: '...', output: {/* ... */} },
  ]
})
```

## Other

你应该能从这个列表上知道 apipgen 还能做什么（sorry 我太懒。

- import（导入 API 中的相关字段别名 - http 或 type）

- paramsPartial（强制所有参数为可选）
