import type { ApiPipeline } from '@genapi/shared'
import fs from 'fs-extra'

export function dest(configRead: ApiPipeline.ConfigRead) {
  configRead.outputs.map(async (output) => {
    await fs.ensureDir(output.root)
    await fs.writeFile(output.path, output.code || '', { flag: 'w' })
  })
}
