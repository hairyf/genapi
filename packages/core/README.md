# @genapi/core

<!-- automd:badges -->

[![npm version](https://img.shields.io/npm/v/@genapi/core)](https://npmjs.com/package/@genapi/core)
[![npm downloads](https://img.shields.io/npm/dm/@genapi/core)](https://npm.chart.dev/@genapi/core)

<!-- /automd -->

CLI and config entry for generating TypeScript/JavaScript API code from OpenAPI/Swagger and other inputs.

## Installation

```bash
pnpm add -D @genapi/core @genapi/presets
```

## Usage

Create `genapi.config.ts` or `genapi.config.js` in your project root, then run the `genapi` command.

## API

<!-- automd:jsdocs src=src/index.ts -->

## Core

### `operatePipelineGenerator(config)`

Runs the GenAPI pipeline for one or more configs. Resolves pipeline by name (e.g. `swag-axios-ts`), then runs config → original → parser → compiler → generate → dest.

## Inject

### `inject(scope)`

Gets the current pipeline context for the given scope (default: `'default'`). Used inside pipeline steps to read config/graphs.

### `ApiPipeline`

- **Type**: `undefined`
- **Default**: `undefined`

### `context`

- **Type**: `any`
- **Default**: `{}`

### `defineConfig(config)`

Defines GenAPI config for `genapi.config.ts` / `genapi.config.js`. Supports single-service config or multi-service `servers` config.

**Example:**

```ts
export default defineConfig({
  pipeline: axios.ts,
  input: 'http://example.com/api-docs',
  output: { main: 'src/api/index.ts', type: 'src/api/index.type.ts' },
})
```

### `provide()`

<!-- /automd -->

## License

[MIT](https://github.com/hairyf/genapi/blob/main/LICENSE)

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
