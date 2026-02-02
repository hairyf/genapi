# @genapi/parser

<!-- automd:badges -->

[![npm version](https://img.shields.io/npm/v/@genapi/parser)](https://npmjs.com/package/@genapi/parser)
[![npm downloads](https://img.shields.io/npm/dm/@genapi/parser)](https://npm.chart.dev/@genapi/parser)

<!-- /automd -->

Parses OpenAPI/Swagger documents into internal data graphs (paths, parameters, schema, etc.) for pipeline compilation and code generation.

## Installation

```bash
pnpm add @genapi/parser
```

## API

<!-- automd:jsdocs src=src/index.ts -->

## Transform

### `transformBaseURL(source)`

Injects baseURL from config into spec when config.baseURL is set.

### `transformQueryParams(name)`

Transforms query params for codegen: optional URLSearchParams snippet and option list updates.

### `transformUrlSyntax(url)`

Wraps URL in template literal or string literal and optionally prefixes baseURL.

## Traverse

### `traversePaths(paths, callback)`

Walks OpenAPI paths and invokes a callback for each path + method with merged parameters and options.

### `fillParameters(options, parameters)`

### `isRequiredParameter(fields)`

Determine if the current parameters are mandatory

### `literalFieldsToString(fields)`

**Example:**

```ts
{
a
}
<
'a'
```

**Example:**

```ts
['a', 'b']
> {
  a:
b
}
```

**Example:**

```ts
['...',
'c']
>
{
...c
}
Convert literal fields to string
```

### `parseHeaderCommits(source)`

parse OpenAPI info to commits

### `parseMethodMetadata()`

### `parseMethodParameters(schemas?)`

parse params to function options

### `parseOpenapiSpecification(source)`

### `parseParameterFiled(parameter)`

parse parameter to filed

### `parseSchemaType(propertie)`

parse schema to type

### `replaceMainext(output?, ext)`

### `signAnyInter(fields)`

对类型进行 any 签名

### `spliceEnumDescription(name, enums)`

splice enum description

### `spliceEnumType(enums)`

splice enum type

### `toUndefField(inType, schemas)`

### `transformBodyStringify(name)`

### `transformDefinitions(definitions)`

### `transformFetchBody(url, options, spaceResponseType)`

### `transformHeaderOptions(name)`

### `transformParameters(parameters, options)`

### `useRefMap(ref)`

ref map

### `varFiled(name)`

### `varName(string_)`

Get available variable names

<!-- /automd -->

## License

[MIT](https://github.com/hairyf/genapi/blob/main/LICENSE)

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
