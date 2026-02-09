# @genapi/shared

<!-- automd:badges -->

[![npm version](https://img.shields.io/npm/v/@genapi/shared)](https://npmjs.com/package/@genapi/shared)
[![npm downloads](https://img.shields.io/npm/dm/@genapi/shared)](https://npm.chart.dev/@genapi/shared)

<!-- /automd -->

Shared types and utilities for GenAPI: config types, AST statement types, inject/provide context, etc.

## Installation

```bash
pnpm add @genapi/shared
```

## API

<!-- automd:jsdocs src=src/index.ts -->

## Inject

### `inject(scope)`

Gets the current pipeline context for the given scope (default: `'default'`). Used inside pipeline steps to read config/graphs.

**Example:**

```ts
const { configRead, interfaces } = inject()
const config = inject('get/user/1')
```

### `ApiPipeline`

- **Type**: `undefined`
- **Default**: `undefined`

### `context`

- **Type**: `any`
- **Default**: `{}`

### `provide()`

<!-- /automd -->

## License

[MIT](https://github.com/hairyf/genapi/blob/main/LICENSE)

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
