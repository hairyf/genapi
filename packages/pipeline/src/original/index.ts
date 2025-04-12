import type { ApiPipeline } from '@genapi/shared'
import got from 'got'

export async function original(configRead: ApiPipeline.ConfigRead) {
  if (configRead.inputs.uri)
    configRead.source = await got({ url: configRead.inputs.uri, responseType: 'json' }).json<any>()
  if (configRead.inputs.http)
    configRead.source = await got({ ...configRead.inputs.http, responseType: 'json' }).json<any>()
  if (configRead.inputs.json)
    configRead.source = await readJsonSource(configRead.inputs.json)

  if (!configRead.source)
    throw new Error('No source found, please check your input config.')

  if (!configRead.source.schemes?.length) {
    const schemes: string[] = []
    if (configRead.inputs.uri?.startsWith('https://'))
      schemes.push('https', 'http')
    if (configRead.inputs.uri?.startsWith('http://'))
      schemes.push('http')
    configRead.source.schemes = schemes
  }

  return configRead
}

function readJsonSource(json: string | Record<string, any>) {
  if (!json)
    return
  if (typeof json === 'object')
    return json
  else
    return import(json).then(mod => mod.default)
}
