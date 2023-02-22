import fs from 'fs-extra'
import type { OpenAPIBuildConfigurationRead } from '../typings/generator'

export const dest = async (options: OpenAPIBuildConfigurationRead) => {
  await Promise.all(
    (options?.outputs || []).map(async (item) => {
      await fs.ensureDir(item.root)
      await fs.writeFile(item.path, item.code || '', { flag: 'w' })
    }),
  )
}
