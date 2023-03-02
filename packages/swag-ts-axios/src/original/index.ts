import type { ApiPipeline } from 'apipgen'
import got from 'got'

export async function original(configRead: ApiPipeline.ConfigRead) {
  if (configRead.inputs.uri)
    configRead.source = await got.get(configRead.inputs.uri).json<any>()
  if (configRead.inputs.json)
    configRead.source = configRead.inputs.json

  if (!configRead.source)
    throw new Error('Please enter source')

  return configRead
}
