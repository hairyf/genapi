# @genapi/transform

<!-- automd:badges -->

[![npm version](https://img.shields.io/npm/v/@genapi/transform)](https://npmjs.com/package/@genapi/transform)
[![npm downloads](https://img.shields.io/npm/dm/@genapi/transform)](https://npm.chart.dev/@genapi/transform)

<!-- /automd -->

Spec transforms: Swagger 2 ↔ OpenAPI 3, WordPress REST API → Swagger 2, etc., so the parser works with a unified format.

## Installation

```bash
pnpm add @genapi/transform
```

## API

<!-- automd:jsdocs src=src/index.ts -->

## Transform

### `swagger2ToSwagger3(source)`

Normalizes OpenAPI 3.x to a Swagger 2–like shape (host, basePath, schemes, definitions from components.schemas). Mutates and returns the same object for use with Swagger 2–based tooling.

**Example:**

```ts
const swagger2Like = swagger2ToSwagger3(openApi3Spec)
// swagger2Like.host, basePath, definitions, schemes set from servers/components
```

### `wpapiToSwagger2(source)`

Converts WordPress REST API schema to Swagger 2.0 format.

**Example:**

```ts
const swagger = wpapiToSwagger2({ routes: { '/wp/v2': { namespace: 'wp/v2', endpoints: [...] } } })
// Use with parser or pipeline as OpenAPI 2.0 input
```

### `buildParam(name, method, endpoint, detail)`

Builds a single OpenAPI parameter from WordPress argument definition.

**Example:**

```ts
buildParam('id', 'GET', '/posts/{id}', { type: 'integer' }) // { name: 'id', in: 'path', type: 'integer', ... }
```

### `convertEndpoint(endpoint)`

eslint-disable no-cond-assign

Converts WordPress-style path patterns to Swagger path format.

**Example:**

```ts
convertEndpoint('/wp/v2/posts/(?P<id>[\\d]+)') // '/wp/v2/posts/{id}'
```

### `default`

### Transform

#### `swagger2ToSwagger3(source)`

Normalizes OpenAPI 3.x to a Swagger 2–like shape (host, basePath, schemes, definitions from components.schemas). Mutates and returns the same object for use with Swagger 2–based tooling.

**Example:**

```ts
const swagger2Like = swagger2ToSwagger3(openApi3Spec)
// swagger2Like.host, basePath, definitions, schemes set from servers/components
```

#### `wpapiToSwagger2(source)`

Converts WordPress REST API schema to Swagger 2.0 format.

**Example:**

```ts
const swagger = wpapiToSwagger2({ routes: { '/wp/v2': { namespace: 'wp/v2', endpoints: [...] } } })
// Use with parser or pipeline as OpenAPI 2.0 input
```

### `getParametersFromArgs(endpoint, args, method)`

Builds OpenAPI parameters from WordPress endpoint args.

**Example:**

```ts
getParametersFromArgs('/posts/{id}', { id: { type: 'integer' } }, 'GET')
```

### `getParametersFromEndpoint(endpoint)`

Extracts path parameters from a WordPress-style endpoint pattern.

**Example:**

```ts
getParametersFromEndpoint('/posts/(?P<id>[\\d]+)') // [{ name: 'id', in: 'path', type: 'integer', required: true }]
```

<!-- /automd -->

## License

[MIT](https://github.com/hairyf/genapi/blob/main/LICENSE)

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
