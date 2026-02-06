import type { ApiPipeline } from '@genapi/core'
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

  const apiConfig = defineConfig({
    preset: presetPipeline,
    input: { json: body.swagger },
    output: {
      main: 'index.ts',
      type: body.mode === 'ts' ? 'index.type.ts' : false,
    },
  })

  const configRead = await runPipeline(apiConfig) as ApiPipeline.ConfigRead

  const mainOutput = configRead.outputs.find(o => o.type === 'request')
  const typeOutput = configRead.outputs.find(o => o.type === 'typings')

  return {
    main: mainOutput?.code || '',
    type: typeOutput?.code || '',
  }
})
