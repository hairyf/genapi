import { Schema } from './schema'

export interface Parameter extends Schema {
  name: string
  in: 'body' | 'header' | 'query' | 'path' | 'formData'
  type?: Schema['type']
  description?: string
  required?: boolean
  schema?: Schema
}
