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

### `generate(config)`

Runs the GenAPI pipeline for one or more configs. Resolves pipeline by name (e.g. `swag-axios-ts`), then runs config → original → parser → compiler → generate → dest.

**Example:**

```ts
await generate(defineConfig({ preset: 'swag-axios-ts', input: 'openapi.json', output: { main: 'src/api.ts' } }))
await generate([config1, config2])
```

## Inject

### `inject(scope)`

Gets the current pipeline context for the given scope (default: `'default'`). Used inside pipeline steps to read config/graphs.

**Example:**

```ts
const { configRead, interfaces } = inject()
const config = inject('get/user/1')
```

### `absolutePath(_path)`

Resolves a path to an absolute path; relative paths are resolved against cwd().

**Example:**

```ts
absolutePath('./presets/axios') // path.resolve(cwd(), './presets/axios')
absolutePath('/etc/config') // '/etc/config'
```

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
  preset: axios.ts,
  input: 'https://petstore3.swagger.io/api/v3/openapi.json',
  output: { main: 'src/api/index.ts', type: 'src/api/index.type.ts' },
})
```

### `inPipeline(pipe)`

Resolves a pipeline from a preset name or function. Tries @genapi/presets/{name}, genapi-{name}, then local path.

**Example:**

```ts
const pipeline = await inPipeline('swag-axios-ts')
await pipeline(config)
```

### `provide()`

<!-- /automd -->

## License

[MIT](https://github.com/hairyf/genapi/blob/main/LICENSE)

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
