import fs from 'fs-extra'
import type { ApiPipeline } from '@genapi/config'

export function dest(configRead: ApiPipeline.ConfigRead) {
  configRead.outputs.map(async (output) => {
    await fs.ensureDir(output.root)
    await fs.writeFile(output.path, output.code || '', { flag: 'w' })
  })
}
