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

Compiles graphs to AST: request code and typings for each output.

### `config(userConfig)`

Normalizes pipeline config: output paths, responseType, baseURL, and builds ConfigRead with inputs/outputs.

### `default(config, original, parser, compiler, generate, dest)`

Builds a GenAPI pipeline from five steps: config → original → parser → compiler → generate → dest.

### `dest(configRead)`

Writes output files from configRead.outputs (code to path).

### `generate(configRead)`

Generates code string from AST for each output and formats with Prettier.

### `original(configRead)`

Fetches source: resolves uri/http/json from configRead.inputs and sets configRead.source.

<!-- /automd -->

## License

[MIT](https://github.com/hairyf/genapi/blob/main/LICENSE)

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
