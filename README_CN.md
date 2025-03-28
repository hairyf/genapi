# genapi

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

API生成器，用于将OpenAPI（v2~v3）和其他输入源转换为TypeScript/JavaScript API。

## 特性

- 🚀 **多种HTTP客户端** - 支持各种HTTP客户端:
  - `axios` - 流行的基于Promise的HTTP客户端
  - `fetch` - 原生浏览器fetch API
  - `ky` - 小巧优雅的HTTP客户端
  - `got` - 人性化的HTTP请求库
  - `ofetch` - 更好的fetch API，带有TypeScript支持

- 🔄 **语言支持** - 生成TypeScript和JavaScript API:
  - `swag-axios-ts` / `swag-axios-js`
  - `swag-fetch-ts` / `swag-fetch-js`
  - `swag-ky-ts` / `swag-ky-js`
  - `swag-got-ts` / `swag-got-js`
  - `swag-ofetch-ts` / `swag-ofetch-js`

- 🛠️ **可定制** - 灵活的管道系统，用于自定义生成过程

## 安装

```bash
# pnpm
npm i @genapi/core @genapi/presets -D
```

> 你也可以全局安装，但不推荐这样做。

## 使用方法

在项目根目录创建配置文件:

- `genapi.config.ts`
- `genapi.config.js`
- `genapi.config.json`

```ts
import { defineConfig } from '@genapi/core'
import { axios } from '@genapi/presets'

export default defineConfig({
  pipeline: axios.ts,
  // 你的输入源（swagger api url或json）
  input: 'http://example.com/api-docs',
  output: {
    main: 'src/api/index.ts',
    type: 'src/api/index.type.ts',
  },

  // 你的API基础URL
  baseURL: 'import.meta.env.VITE_APP_BASE_API',
  // 自定义输出响应类型，默认为'T'
  responseType: 'T extends { data?: infer V } ? V : void',
})
```

然后运行:

```bash
npm run genapi
```

## 输入源

输入支持URL或JSON格式:

```ts
export default defineConfig({
  // 直接传入url
  input: 'http://example.com/api-docs',
  // 或JSON对象
  input: { /* url|json */ }
})
```

## 多服务配置

对于有多个服务的项目，使用`server`配置:

```ts
export default defineConfig({
  // 你的API基础URL，此配置将传递给axios请求
  baseUrl: 'https://example.com/api',
  // 所有服务器继承上层配置
  server: [
    { input: 'http://service1/api-docs', output: { main: 'src/api/service1.ts' } },
    { input: 'http://service2/api-docs', output: { main: 'src/api/service2.ts' } },
    { input: 'http://service3/api-docs', output: { main: 'src/api/service3.ts' } },
  ]
})
```

## swag-axios-js

使用任何`js`管道生成带有类型的JavaScript文件:

```ts
export default defineConfig({
  pipeline: 'swag-axios-js',
  input: {
    uri: 'https://petstore.swagger.io/v2/swagger.json',
  },
})
```

运行`genapi`后得到:

![swag-axios-js](public/swag-axios-js.png)

## 自定义管道

管道是genapi的核心。你可以创建自定义管道:

```ts
// 使用genapi提供的管道创建API管道生成器
import pipeline, { compiler, dest, generate, original } from '@genapi/pipeline'
// 每个管道都暴露相应的方法，可以重用和重组
import { axios } from '@genapi/presets'

export default defineConfig({
  pipeline: pipeline(
    // 读取配置，转换为内部配置，并提供默认值
    config => axios.ts.config(config),
    // 获取数据源
    configRead => original(configRead),
    // 将数据源解析为数据图
    configRead => axios.ts.parser(configRead),
    // 编译数据并转换为抽象语法树（AST）
    configRead => compiler(configRead),
    // 生成代码字符串
    configRead => generate(configRead),
    // 使用输出到输出文件
    configRead => dest(configRead),
  ),
})
```

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
