import { createSchemaCompiler } from '../../../_shared/schema'

export const compiler = createSchemaCompiler({
  httpClient: 'fetch',
})
