# @genapi/pipeline

<!-- automd:badges -->

[![npm version](https://img.shields.io/npm/v/@genapi/pipeline)](https://npmjs.com/package/@genapi/pipeline)
[![npm downloads](https://img.shields.io/npm/dm/@genapi/pipeline)](https://npm.chart.dev/@genapi/pipeline)

<!-- /automd -->

GenAPI pipeline core: config reading, data source fetching, parsing, compilation, generation, and output. Composable for custom generation flows.

## Installation

```bash
pnpm add @genapi/pipeline
```

## API

<!-- automd:jsdocs src=src/index.ts -->

## Pipeline

### `compiler(configRead)`

Compiles graphs to code string: request and typings for each output.

**Example:**

```ts
compiler(configRead)
configRead.outputs.forEach(o => console.log(o.code))
```

### `config(userConfig)`

Normalizes pipeline config: output paths, responseType, baseURL, and builds ConfigRead with inputs/outputs.

**Example:**

```ts
const configRead = config(defineConfig({ input: 'openapi.json', output: { main: 'src/api.ts' } }))
```

### `default(config, original, parser, compiler, generate, dest)`

Builds a GenAPI pipeline from five steps: config → original → parser → compiler → generate → dest.

**Example:**

```ts
const run = pipeline(config, original, parser, compiler, generate, dest)
await run(defineConfig({ input: 'openapi.json', output: { main: 'src/api.ts' } }))
```

### `dest(configRead)`

Writes output files from configRead.outputs (code to path).

**Example:**

```ts
await dest(configRead)
// Writes configRead.outputs[].code to configRead.outputs[].path
```

### `generate(configRead, options?)`

Formats code for each output with Prettier.

**Example:**

```ts
await generate(configRead)
await generate(configRead, { printWidth: 100 })
```

### `original(configRead)`

Fetches source: resolves uri/http/json from configRead.inputs and sets configRead.source. Transforms the source based on parser configuration (wpapi -> swagger2, swagger -> unchanged). Supports YAML source URLs (e.g. .yaml / .yml); uses confbox for parsing (same as undocs).

**Example:**

```ts
await original(configRead)
// configRead.source is set from uri/http/json; wpapi transformed to swagger2 if parser is 'wpapi'
```

### `compilerTsRequestDeclaration(configRead)`

Compiles configRead graphs to TypeScript request module code (imports, variables, functions).

**Example:**

```ts
const code = compilerTsRequestDeclaration(configRead)
await fs.writeFile('src/api.ts', code)
```

### `compilerTsTypingsDeclaration(configRead, comment)`

Compiles configRead graphs to TypeScript typings code (type aliases, interfaces, optional header comment).

**Example:**

```ts
const code = compilerTsTypingsDeclaration(configRead)
await fs.writeFile('src/api.type.ts', code)
```

### `formatTypescript(code, options?)`

Formats TypeScript/JavaScript code string with Prettier.

**Example:**

```ts
const formatted = await formatTypescript('const x=1')
```

<!-- /automd -->

## License

[MIT](https://github.com/hairyf/genapi/blob/main/LICENSE)

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
