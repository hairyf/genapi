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

### `wpapiToSwagger2(source)`

Converts a WordPress REST API schema to Swagger 2.0 format.

### `buildParam(name, method, endpoint, detail)`

Builds a parameter object from parameter definition

### `convertEndpoint(endpoint)`

eslint-disable ts/ban-ts-comment

eslint-disable no-cond-assign

Converts WordPress-style endpoints to Swagger style Example: /wp/v2/posts/(?P<id>[\d]+) -> /wp/v2/posts/{id}

### `default`

### Transform

#### `swagger2ToSwagger3(source)`

Normalizes OpenAPI 3.x to a Swagger 2–like shape (host, basePath, schemes, definitions from components.schemas). Mutates and returns the same object for use with Swagger 2–based tooling.

#### `wpapiToSwagger2(source)`

Converts a WordPress REST API schema to Swagger 2.0 format.

### `getParametersFromArgs(endpoint, args, method)`

Extracts parameters from argument definitions

### `getParametersFromEndpoint(endpoint)`

Extracts path parameters from an endpoint

<!-- /automd -->

## License

[MIT](https://github.com/hairyf/genapi/blob/main/LICENSE)

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
