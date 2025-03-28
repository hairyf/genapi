# genapi

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

> [中文](./README_CN.md) | English

API generator that converts OpenAPI (v2~v3) and other input sources into TypeScript/JavaScript APIs.

## Features

- 🚀 **Multiple HTTP Clients** - Support for various HTTP clients:
  - `axios` - Popular promise-based HTTP client
  - `fetch` - Native browser fetch API
  - `ky` - Tiny and elegant HTTP client
  - `got` - Human-friendly HTTP request library
  - `ofetch` - A better fetch API with TypeScript support

- 🔄 **Language Support** - Generate both TypeScript and JavaScript APIs:
  - `swag-axios-ts` / `swag-axios-js`
  - `swag-fetch-ts` / `swag-fetch-js`
  - `swag-ky-ts` / `swag-ky-js`
  - `swag-got-ts` / `swag-got-js`
  - `swag-ofetch-ts` / `swag-ofetch-js`

- 🛠️ **Customizable** - Flexible pipeline system for customizing the generation process

## Installation

```bash
# pnpm
npm i @genapi/core @genapi/presets -D
```

> You can also install it globally but it's not recommended.

## Usage

Create a configuration file in your project root:

- `genapi.config.ts`
- `genapi.config.js`
- `genapi.config.json`

```ts
import { defineConfig } from '@genapi/core'
import { axios } from '@genapi/presets'

export default defineConfig({
  pipeline: axios.ts,
  // your input source (swagger api url or json)
  input: 'http://example.com/api-docs',
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

Then run:

```bash
npm run genapi
```

## Input Sources

Input supports URL or JSON format:

```ts
export default defineConfig({
  // directly pass in url
  input: 'http://example.com/api-docs',
  // or JSON object
  input: { /* url|json */ }
})
```

## Multiple Services

For projects with multiple services, use the `server` configuration:

```ts
export default defineConfig({
  // Your API baseUrl, this configuration will be passed to the axios request
  baseUrl: 'https://example.com/api',
  // all servers inherit the upper layer configuration
  server: [
    { input: 'http://service1/api-docs', output: { main: 'src/api/service1.ts' } },
    { input: 'http://service2/api-docs', output: { main: 'src/api/service2.ts' } },
    { input: 'http://service3/api-docs', output: { main: 'src/api/service3.ts' } },
  ]
})
```

## swag-axios-js

Use any `js` pipeline to generate JavaScript files with types:

```ts
export default defineConfig({
  pipeline: 'swag-axios-js',
  input: {
    uri: 'https://petstore.swagger.io/v2/swagger.json',
  },
})
```

Run `genapi` and get:

![swag-axios-js](public/swag-axios-js.png)

## Custom Pipeline

Pipeline is the core of genapi. You can create custom pipelines:

```ts
// create an API pipeline generator using the pipeline provided by genapi
import pipeline, { compiler, dest, generate, original } from '@genapi/pipeline'
// each pipeline exposes corresponding methods, which can be reused and reorganized
import { axios } from '@genapi/presets'

export default defineConfig({
  pipeline: pipeline(
    // read config, convert to internal config, and provide default values
    config => axios.ts.config(config),
    // get data source
    configRead => original(configRead),
    // parse the data source as data graphs
    configRead => axios.ts.parser(configRead),
    // compile data and convert it into abstract syntax tree (AST)
    configRead => compiler(configRead),
    // generate code string
    configRead => generate(configRead),
    // use outputs to output files
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
