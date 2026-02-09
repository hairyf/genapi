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

**Example:**

```ts
transformBaseURL(spec)
// configRead.config.meta.baseURL and configRead.graphs.variables may be set from spec.host/schemes
```

### `transformOperation(options)`

Applies `config.transform.operation` (global) and `config.patch.operations` (static) to a single operation.

The returned object contains the final `name`, `parameters`, and `responseType`. Note: `parameters` are always the same array instance passed in; when overridden by a patch, the array is mutated in place (cleared and re-filled) so callers using a `const` reference remain valid.

**Example:**

```ts
const result = transformOperation({ configRead, name: 'getUserUsingGET', parameters, responseType: 'User' })
// result.name, result.parameters, result.responseType (after transform + patch)
```

### `transformQueryParams(name)`

Transforms query params for codegen: optional URLSearchParams snippet and option list updates.

**Example:**

```ts
const urlSuffix = transformQueryParams('query', { body: [], options: ['query'], url: '/api' })
// urlSuffix may be '?${querystr}', body/options mutated
```

### `transformUrlSyntax(url)`

Wraps URL in template literal or string literal and optionally prefixes baseURL.

**Example:**

```ts
transformUrlSyntax('/user/${paths.id}', { baseURL: true }) // '${baseURL}/user/${paths.id}' as template
transformUrlSyntax('/api') // "'/api'"
```

## Traverse

### `traversePaths(paths, callback)`

Walks OpenAPI paths and invokes a callback for each path + method with merged parameters and options.

**Example:**

```ts
traversePaths(spec.paths, (config) => {
  const { path, method, parameters } = config
  // handle each operation
})
```

### `createParser(pathHandler)`

Creates a unified parser entry that reuses the common flow: parse spec → inject context → transform baseURL/definitions → traverse paths. Presets only need to implement pathHandler, avoiding duplicated parser() and transformPaths boilerplate.

**Example:**

```ts
const parser = createParser((config, ctx) => {
  const meta = parseMethodMetadata(config)
  ctx.functions.push({ name: meta.name, parameters: meta.parameters, body: [] })
})
const configRead = parser(configRead)
```

### `fillParameters(options, parameters)`

Merges path-level parameters with operation-level parameters; operation params override by name.

**Example:**

```ts
fillParameters(pathItem.get, pathParams) // [...pathParams, ...get.parameters] with dedup by name
```

### `isParameter(p: { $ref? })`

Type guard: checks if the value is an inline parameter (has name and in), not a $ref.

**Example:**

```ts
if (isParameter(item)) { const { name, in: loc } = item }
```

### `isRequiredParameter(fields)`

Returns whether any of the given fields are required (and not index signature / any).

**Example:**

```ts
isRequiredParameter([{ name: 'id', required: true, type: 'string' }]) // true
isRequiredParameter([{ name: 'tag', required: false }]) // false
```

### `literalFieldsToString(fields)`

A single option for codegen: either a bare identifier or a [key, value] pair (or spread).

**Example:**

```ts
'a'
yields
{
a
};
['a',
'b']
yields
{
a:
b
};
['...',
'c']
yields
{
...c
}
Converts an array of LiteralField into a single comma-separated code string for object literals.
```

**Example:**

```ts
literalFieldsToString([['method', "'GET'"], 'body']) // "method:'GET', body"
```

### `parseHeaderCommits(source)`

Extracts OpenAPI info (title, description, swagger, version) into comment lines for generated file header.

**Example:**

```ts
const comments = parseHeaderCommits(swaggerSpec)
// ['@title My API', '@swagger 2.0', '@version 1.0']
```

### `parseMethodMetadata()`

Builds method metadata (name, url template, response type, comments) from path/method and applies transform/patch.

**Example:**

```ts
const meta = parseMethodMetadata(pathMethod)
// meta.name, meta.url, meta.responseType, meta.description
```

### `parseMethodParameters(schemas?)`

Parses path/method parameters into function options (body, query, path, header, etc.) and provides config for codegen.

**Example:**

```ts
const config = parseMethodParameters({ method: 'get', path: '/user/{id}', parameters }, schemas)
// config.parameters, config.options, config.interfaces
```

### `parseOpenapiSpecification(source)`

Normalizes input spec to Swagger 2–like shape: passes through Swagger 2 or converts OpenAPI 3.x via swagger2ToSwagger3.

**Example:**

```ts
const spec = parseOpenapiSpecification(openApi3Doc)
// spec has host, basePath, definitions for downstream parser
```

### `parseParameterFiled(parameter)`

Converts a single OpenAPI parameter into a StatementField (name, type, required, description).

**Example:**

```ts
const field = parseParameterFiled({ name: 'id', in: 'path', type: 'string', required: true })
// { name: 'id', type: 'string', required: true }
```

### `parseSchemaType(propertie)`

Resolves an OpenAPI schema (or property) to a TypeScript type string; handles $ref, allOf, object, array, primitives.

**Example:**

```ts
parseSchemaType({ type: 'string' }) // 'string'
parseSchemaType({ $ref: '#/definitions/User' }) // 'User'
parseSchemaType({ type: 'array', items: { type: 'number' } }) // 'number[]'
```

### `replaceMainext(output?, ext)`

Swaps file extension between .ts and .js in output path (e.g. for dual TS/JS presets).

**Example:**

```ts
replaceMainext('src/api/index.ts', 'js') // 'src/api/index.js'
```

### `signAnyInter(fields)`

Appends an index signature [key: string]: any to the fields array (for open object types).

**Example:**

```ts
signAnyInter(headerFields) // headerFields now has [key: string]: any
```

### `spliceEnumDescription(name, enums)`

Builds JSDoc @param line for an enum query parameter (allowed values and example query string).

**Example:**

```ts
spliceEnumDescription('status', ['a', 'b']) // "@param status 'a,b' | 'status=a&status=b'"
```

### `spliceEnumType(enums)`

Builds a TypeScript union array type from enum strings (e.g. 'a' | 'b' for array).

**Example:**

```ts
spliceEnumType(['draft', 'published']) // "('draft' | 'published')[]"
```

### `toUndefField(inType, schemas)`

Resolves the option key for a parameter location (e.g. 'path' -> 'paths') from schemas or default map.

**Example:**

```ts
toUndefField('query') // 'query'
toUndefField('body', { body: 'data' }) // 'data'
```

### `transformBodyStringify(name)`

Options for body JSON stringify transform: option list and parameter list.

Replaces a body option with a JSON.stringify(...) literal when the parameter is not FormData/any.

**Example:**

```ts
transformBodyStringify('body', { options: ['body', 'query'], parameters: [{ name: 'body', type: 'CreateDto' }] })
// options may become [['body', 'JSON.stringify(body || {})'], 'query']
```

### `transformDefinitions(definitions)`

Converts OpenAPI definitions (schemas) to StatementInterface entries and pushes to context interfaces; applies config transform/patch.

**Example:**

```ts
transformDefinitions(spec.definitions)
// inject().interfaces now includes User, Order, etc.
```

### `transformFetchBody(url, options, spaceResponseType)`

Returns the request/response body snippet for fetch-based clients (json/text/none/void) based on response type.

**Example:**

```ts
transformFetchBody('url', ['method: "GET"'], 'User') // ['const response = await fetch(url, {...})', 'return response.json() as Promise<User>']
```

### `transformHeaderOptions(name)`

Options for header transform: option list and parameter list.

Injects Content-Type headers (application/json or multipart/form-data) into options and removes standalone 'headers' option when present.

**Example:**

```ts
transformHeaderOptions('headers', { parameters: [...], options: ['headers', 'body'] })
// options get 'headers' replaced with literal { 'Content-Type': 'application/json', ...headers }
```

### `transformParameters(parameters, options)`

Options for parameter/response type transform (syntax, namespace, generic, infer).

Transforms parameter types and response type for target syntax (TypeScript vs ECMAScript JSDoc); mutates parameters and description.

**Example:**

```ts
const { spaceResponseType } = transformParameters(parameters, { configRead, interfaces, description: [], responseType: 'User', syntax: 'typescript' })
```

### `useRefMap(ref)`

Extracts the last segment from a $ref path (e.g. '#/definitions/User' -> 'User').

**Example:**

```ts
useRefMap('#/definitions/UserDto') // 'UserDto'
```

### `varFiled(name)`

Escapes a property name for codegen: wraps in quotes if it contains non-identifier characters.

**Example:**

```ts
varFiled('userId') // 'userId'
varFiled('data-id') // "'data-id'"
```

### `varName(string_)`

Converts a string or path segments into a valid PascalCase identifier (transliterates, strips non-alphanumeric).

**Example:**

```ts
varName('get /user/info') // 'UserInfo'
varName(['get', 'user', 'id']) // 'UserId'
```

<!-- /automd -->

## License

[MIT](https://github.com/hairyf/genapi/blob/main/LICENSE)

<!-- automd:with-automd -->

---

_🤖 auto updated with [automd](https://automd.unjs.io)_

<!-- /automd -->
