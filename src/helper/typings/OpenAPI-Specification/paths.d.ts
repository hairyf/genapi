import { Parameter } from './parameter'
import { Schema, Properties } from './schema'

export interface Paths {
  [path: string]: {
    get: Method
    put: Method
    post: Method
    delete: Method
    options: Method
    head: Method
    patch: Method
    parameters: Parameter[]
  }
}

export interface Method {
  tags: string[]
  summary: string
  description: string
  operationId: string
  consumes: string[]
  produces: string[]
  parameters: Parameter[]
  responses: Responses
  security: Security[]
}

export interface Responses {
  [status: number]: {
    description: string
    headers: Properties
    schema: Schema
  }
}

export interface Security {
  petstore_auth: string[]
  api_key: string[]
}
