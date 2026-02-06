# genapi

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

> [中文](./README_CN.md) | **English**
> [English Docs](http://genapi-docs.vercel.app/)

A lightweight API code generator—only the code you need.

## Features

- 🚀 **Multiple HTTP Clients** - Support for [axios](https://github.com/axios/axios), [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), [ky](https://github.com/sindresorhus/ky), [got](https://github.com/sindresorhus/got), [ofetch](https://github.com/unjs/ofetch), [TanStack Query](https://github.com/TanStack/query) (React/Vue), [uni](https://github.com/uni-helper/uni-network)
- 🔄 **TypeScript & JavaScript** - Generate both TS and JS APIs with full type definitions
- 📋 **Schema Mode** - Type-safe fetch APIs with schema-based typing (supports `fetch` and `ofetch` presets)
- 📖 **Multiple Data Sources** - Support for OpenAPI 2.0/3.x, Swagger and other input sources
- 🔧 **Interactive CLI** - Use `genapi init` for guided setup with preset selection
- 🛠️ **Customizable Pipeline** - Flexible pipeline system for customizing the generation process
- 🔀 **Transform & Patch** - Batch transform operations and types, or make exact-match modifications
- 🎭 **Mock Data** - Automatically generate mock methods for each API function (requires `better-mock`)
- 🌐 **Multiple Services** - Support for projects with multiple API services via `servers` configuration
- ⚡️ **Type Safety** - Full TypeScript support with type inference and IntelliSense
- 📦 **Zero Config** - Works out of the box with sensible defaults, customize as needed

## Usage

### Init Project

Just run the following command to init your project:

```bash
# pnpm (recommended)
pnpm dlx @genapi/core genapi init
# npx @genapi/core genapi init
# yarn dlx @genapi/core genapi init
```

Or install and configure manually:

```bash
pnpm i @genapi/core @genapi/presets -D
```

Create `genapi.config.ts`:

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

Then run to generate API code like:

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

For more details and features, visit the [documentation site](http://genapi-docs.vercel.app/).

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
