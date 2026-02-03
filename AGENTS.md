# AGENTS

## Testing Guidelines

- **Specification benchmark**: Conduct unit testing based on OpenAPI 2.0 (Swagger 2.0) and OpenAPI 3.2 specification benchmarks. Use skills `openapi-specification-v2` and `openapi-specification-v3.2` when writing or validating tests and fixtures.
- **Coverage**: Strive to cover all scenarios as much as possible—paths, operations, parameters, request/response, schema, security, and edge cases defined in the specs.
- **Scope**: Focus unit tests on the following subpackages:
  - `packages/parser` — parsing and transforming OpenAPI/Swagger structures
  - `packages/transform` — spec conversions (e.g. Swagger 2 → 3, wpapi → Swagger 2)
- **Failure handling**: If a single test fails, **prioritize fixing the source code** (implementation bugs, spec violations) rather than changing the test code to make the test pass.

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: `npx openskills read <skill-name>` (run in your shell)
  - For multiple: `npx openskills read skill-one,skill-two`
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>arch-tsdown-monorepo</name>
<description>pnpm monorepo starter for TypeScript libraries with tsdown per package. Use when scaffolding or maintaining a multi-package TS/ESM repo with workspace deps and npm Trusted Publisher.</description>
<location>project</location>
</skill>

<skill>
<name>hairy</name>
<description>Hairy's {Opinionated} preferences and best practices for web development</description>
<location>project</location>
</skill>

<skill>
<name>hairy-utils</name>
<description>Comprehensive skills for working with @hairy/utils core utilities</description>
<location>project</location>
</skill>

<skill>
<name>openapi-specification-v2</name>
<description>OpenAPI (Swagger) 2.0 specification for describing REST APIs. Use when writing, validating, or interpreting Swagger 2.0 specs, generating clients/docs, or working with path/operation/parameter/response/schema/security definitions.</description>
<location>project</location>
</skill>

<skill>
<name>openapi-specification-v3.2</name>
<description>OpenAPI Specification 3.2 — write and interpret OpenAPI descriptions (OAD), paths, operations, parameters, request/response, schema (JSON Schema 2020-12), security, and extensions. Use when authoring or validating OpenAPI 3.2 documents.</description>
<location>project</location>
</skill>

<skill>
<name>tsdown</name>
<description>Bundle TypeScript and JavaScript libraries with blazing-fast speed powered by Rolldown. Use when building libraries, generating type declarations, bundling for multiple formats, or migrating from tsup.</description>
<location>project</location>
</skill>

<skill>
<name>undocs</name>
<description>Minimal Documentation Theme and CLI for shared usage across UnJS projects. Use when creating documentation sites with Nuxt, Nuxt Content, and Nuxt UI.</description>
<location>project</location>
</skill>

<skill>
<name>unjs</name>
<description>UnJS ecosystem - agnostic JavaScript libraries, tools, and utilities. Use when working with UnJS packages like h3, nitro, ofetch, unstorage, or building universal JavaScript applications.</description>
<location>project</location>
</skill>

<skill>
<name>vitest</name>
<description>Vitest fast unit testing framework powered by Vite with Jest-compatible API. Use when writing tests, mocking, configuring coverage, or working with test filtering and fixtures.</description>
<location>project</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
