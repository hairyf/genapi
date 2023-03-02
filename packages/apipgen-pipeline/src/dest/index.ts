import fs from 'fs-extra'
import type { ApiPipeline } from 'apipgen'

export function dest(configRead: ApiPipeline.ConfigRead) {
  configRead.outputs.map(async (output) => {
    await fs.ensureDir(output.root)
    await fs.writeFile(output.path, output.code || '', { flag: 'w' })
  })
}
