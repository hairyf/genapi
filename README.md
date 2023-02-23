# API Pipeline Generator

> [中文](./README_CN.md) | English

API pipeline generator, which is used to convert OpenApi (v2~v3) and other input sources into TS/JS APIs, and currently supports axios templates

`apipgen` is developed by the pipeline concept and will be used as a general api generation tool in the future, not limited to `swagger/axios`.

```ts
const process = configs.map(
  pPipe(
    // external mode - config conver
    config => parserTsConfig(config),
    // external mode - data source
    configRead => dataSource(configRead),
    // external mode - to mode
    configRead => JSONParser(configRead),
    // mode          - to internal mode
    configRead => tsCompiler(configRead),
    // internal mode - to view
    configRead => generate(configRead),
    // view          - dest file
    configRead => dest(configRead),
  ),
)
await Promise.all(process)
```

## ⚙️ Install

Install it locally in your project folder:

```bash
pnpm add apipgen -D
# Or Yarn
yarn add apipgen --dev
```

You can also install it globally but it's not recommended.

## 📖 Usage

Currently, the CLI option is not provided, and the output content is determined by the config file. Currently, the following config files are supported:

- `apipgen.config.ts`
- `apipgen.config.js`
- `apipgen.config.cjs`
- `apipgen.config.json`

```ts
import { defineConfig } from 'apipgen'

export default defineConfig({
  // your input source and output file (swagger api url or json)
  // if you have multiple sources, you can use 'server'
  input: 'http://...api-docs',
  output: {
    main: 'src/api/index.ts',
    type: 'src/api/index.type.ts',
  },

  // your API baseUrl
  baseURL: 'import.meta.env.VITE_APP_BASE_API',
  // customize the output response type. default 'T'
  responseType: 'T extends { data?: infer V } ? V : void',
})
```

```sh
# run apipgen
pnpm apipgen
```

![cli-case](public/case.gif)

## Input

Input supports three input sources `url|json|test`

```ts
export default defineConfig({
  // directly pass in url
  input: 'http://...api-docs',
  // or
  input: { /* url|json|test */ }
})
```

## Server

Maybe you have multiple services. You can use 'server' to set multiple services. Usually, other config at the top level are used as additional config

```ts
export default defineConfig({
  // Your API baseUrl, this configuration will be passed to the axios request
  baseUrl: 'https://...',
  // all servers inherit the upper layer configuration
  server: [
    { import: '...', output: {/* ... */} },
    { import: '...', output: {/* ... */} },
    { import: '...', output: {/* ... */} },
  ]
})
```

## Other

Sorry, I'm too lazy. You should know what else Apipgen can do from this list.

- import (import related field aliases in the makefile - http or type)
- paramsPartial (force all parameters to be optional)
