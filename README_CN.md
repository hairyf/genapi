# API Pipeline Generator

> [English](./README.md) | 中文

API 管道生成器，用于将 OpenApi（v2~v3）和其他输入源转换为 TS/JS API，目前支持 swag-ts|swag-js 管道。

`apipgen` 由管道理念开发，作为通用的 `api` 生成工具使用，不局限于 `swagger/axios`。

```ts
const process = configs.map(
  pPipe(
    // 外模式 - 配置转换
    config => readConfig(config),
    // 外模式 - 数据原
    configRead => original(configRead),
    // 外模式 - 转模式
    configRead => parser(configRead),
    // 模式   - 转内模式
    configRead => compiler(configRead),
    // 内模式 - 转视图
    configRead => generate(configRead),
    // 视图   - 输出文件
    configRead => dest(configRead),
  ),
)
await Promise.all(process)
```

## ⚙️ Install

在项目文件夹中本地安装：

```bash
pnpm add apipgen -D
# Or Yarn
yarn add apipgen --dev
```

> 您也可以全局安装，但不建议这样做。

## 📖 Usage

当前未提供CLI选项，输出内容由配置文件确定。目前支持以下配置文件：

- `apipgen.config.ts`
- `apipgen.config.js`
- `apipgen.config.cjs`
- `apipgen.config.json`

```ts
import { defineConfig } from 'apipgen'

export default defineConfig({
  /**
   * 使用的编译 pipeline 支持 npm 包（添加前缀apipgen-）或本地路径
   *
   * 默认支持 swag-ts|swag-js
   * @default 'swag-ts'
   */
  pipeline: 'swag-ts',
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
pnpm apipgen
```

![cli-case](public/case.gif)

## Input


input 目前支持三个输入源 `url|json`

```ts
export default defineConfig({
  // 直接输入 swagger url
  input: 'http://...api-docs',
  // 或者选择其他源
  input: { /* url|json */ }
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

## Pipeline

apipgen 在定义配置时传入 `pipeline` 参数支持 npm 包（前缀 apipgen-） 和本地路径。

```ts
export default defineConfig({
  pipeline: './custom-pipe',
})
```

管道中由 `apipgen` 提供的 `pipeline` 方法定义。

```ts
// custom-pipe.ts

// 使用 apipgen 提供的 pipeline 创建 API 管道生成器
import { pipeline } from 'apipgen'

// 每个管道都暴露了对应方法，可以进行复用并重组
import { dest, generate, original } from 'apipgen-swag-ts'

function myCustomPipe(config) {
  const process = pipeline(
    // 读取配置，转换为内部配置，并提供默认值
    config => readConfig(config),
    // 获取数据源
    configRead => original(configRead),
    // 解析数据源为数据图表（graphs）
    configRead => parser(configRead),
    // 编译数据，转换为抽象语法树（AST）
    configRead => compiler(configRead),
    // 生成代码（code）
    configRead => generate(configRead),
    // 利用 outputs 输出文件
    configRead => dest(configRead),
  )
  return process(config)
}

function readConfig(config) {
  // ...
}

function parser(configRead) {
  // ...
}

function compiler(configRead) {
  // ...
}
```

## Other

你应该能从这个列表上知道 apipgen 还能做什么（sorry 我太懒。

- import（导入 API 中的相关字段别名 - http 或 type）

- paramsPartial（强制所有参数为可选）
