import type { ApiPipeline } from '@genapi/core'
import path from 'node:path'
import { defineConfig } from '@genapi/core'
import presets from '@genapi/presets'
import pPipe from 'p-pipe'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    swagger: string
    preset: 'axios' | 'fetch' | 'got' | 'ky' | 'ofetch' | 'uni' | 'tanstackQuery'
    mode: 'ts' | 'js' | 'schema' | 'react' | 'vue'
  }>(event)

  if (!body.swagger) {
    return { error: 'missing swagger data' }
  }

  if (!body.preset || !body.mode) {
    return { error: 'missing preset or mode parameter' }
  }

  const presetPipeline = (presets as any)[body.preset]?.[body.mode]

  if (!presetPipeline) {
    return { error: `preset not found: ${body.preset}-${body.mode}` }
  }

  const { config, original, parser, compiler, generate } = presetPipeline

  const runPipeline = pPipe(
    config,
    original,
    parser,
    compiler,
    configRead => generate(configRead, { printWidth: 80 }),
  )

  // TanStack Query 需要三文件：main(hooks)、api(apis)、type(types)，且 main 引用 api、api 引用 type
  const isTanstackQuery = body.preset === 'tanstackQuery'
  const output: { main: string, type?: string | false, api?: string } = isTanstackQuery
    ? { main: 'index.ts', type: 'index.type.ts', api: 'index.api.ts' }
    : {
        main: 'index.ts',
        type: body.mode === 'ts' ? 'index.type.ts' : false as const,
      }

  const apiConfig = defineConfig({
    preset: presetPipeline,
    input: { json: body.swagger },
    output,
  })

  const configRead = await runPipeline(apiConfig) as ApiPipeline.ConfigRead

  // pipeline 的 output.type 为 'main' | 'type' | 其他 key，不是 'request'/'typings'
  const files = configRead.outputs.map(output => ({
    filename: path.basename(output.path),
    code: output.code ?? '',
  }))

  return { files }
})
