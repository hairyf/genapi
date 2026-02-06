# genapi

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

> **中文** | [English](./README.md)
<!-- > [中文文档](http://genapi-docs.vercel.app/?lang=zh-CN) -->

一款轻量化的 API 代码生成器，仅仅生成你需要的代码。

## 特性

- 🚀 **多种HTTP客户端** - 支持 [axios](https://github.com/axios/axios)、[fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)、[ky](https://github.com/sindresorhus/ky)、[got](https://github.com/sindresorhus/got)、[ofetch](https://github.com/unjs/ofetch)、[tanstack-query](https://github.com/TanStack/query)、[uni](https://github.com/uni-helper/uni-network)
- 🔄 **TypeScript & JavaScript** - 生成完整的 TS 和 JS API，包含完整的类型定义
- 📋 **Schema 模式** - 基于 schema 的类型安全 fetch API（支持 `fetch` 和 `ofetch` 预设）
- 📖 **多数据源支持** - 支持 OpenAPI 2.0/3.x、Swagger 等多种输入源
- 🔧 **交互式 CLI** - 使用 `genapi init` 进行引导式设置，选择预设配置
- 🛠️ **可定制管道** - 灵活的管道系统，用于自定义生成过程
- 🔀 **转换与补丁** - 批量转换操作和类型，或进行精确匹配的修改
- 🎭 **Mock 数据** - 为每个 API 函数自动生成 mock 方法（需要 `better-mock`）
- 🌐 **多服务支持** - 通过 `servers` 配置支持多个 API 服务
- ⚡️ **类型安全** - 完整的 TypeScript 支持，包含类型推断和 IntelliSense
- 📦 **零配置** - 开箱即用，提供合理的默认值，可按需自定义

## 使用方法

### 初始化项目

运行以下命令来初始化你的项目：

```bash
# pnpm (推荐)
pnpm dlx @genapi/core genapi init
# npx @genapi/core genapi init
# yarn dlx @genapi/core genapi init
```

或手动安装和配置：

```bash
npm i @genapi/core @genapi/presets -D
```

创建 `genapi.config.ts`：

```ts
import { defineConfig } from '@genapi/core'
import { axios } from '@genapi/presets'

export default defineConfig({
  preset: axios.ts,
  input: 'https://petstore3.swagger.io/api/v3/openapi.json',
  output: {
    main: 'src/api/index.ts',
    type: 'src/api/index.type.ts',
  },
})
```

然后运行以下命令

```bash
npx genapi
```

```ts
/*
 * @title Swagger Petstore - OpenAPI 3.0
 * ... other metadata ...
 */

import type { AxiosRequestConfig } from 'axios'
import type * as Types from './index.type'
import http from 'axios'

/**
 * @summary Update an existing pet.
 * @description Update an existing pet by Id.
 * @method put
 * @tags pet
 */
export function putPet(data?: Types.Pet, config?: AxiosRequestConfig) {
  const url = '/pet'
  return http.request<Types.Pet>({ method: 'put', url, data, ...config })
}

/**
 * @summary Add a new pet to the store.
 * @description Add a new pet to the store.
 * @method post
 * @tags pet
 */
export function postPet(data?: Types.Pet, config?: AxiosRequestConfig) {
  const url = '/pet'
  return http.request<Types.Pet>({ method: 'post', url, data, ...config })
}
```

更多详情和功能，请访问[文档网站](http://genapi-docs.vercel.app/)。

## License

[MIT](./LICENSE) License © [Hairyf](https://github.com/hairyf)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@genapi/core?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@genapi/core
[npm-downloads-src]: https://img.shields.io/npm/dm/@genapi/core?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@genapi/core
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@genapi/core?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@genapi/core
[license-src]: https://img.shields.io/github/license/hairyf/genapi.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/hairyf/genapi/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@genapi/core
