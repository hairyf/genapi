import type { ApiPipeline } from '@genapi/shared'
import fs from 'fs-extra'

/**
 * Writes output files from configRead.outputs (code to path).
 *
 * @param configRead - ConfigRead with outputs[].path and outputs[].code
 * @group Pipeline
 */
export function dest(configRead: ApiPipeline.ConfigRead) {
  configRead.outputs.map(async (output) => {
    await fs.ensureDir(output.root)
    await fs.writeFile(output.path, output.code || '', { flag: 'w' })
  })
}
