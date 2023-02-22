import { Properties, Schema } from './schema'

export interface Definition {
  type: Schema['type']
  properties: Properties
  required: string[]
}

export interface Definitions {
  [name: string]: Definition
}

export interface SecurityDefinitions {
  api_key: {
    type: string
    name: string
    in: string
  }
  petstore_auth: {
    type: string
    authorizationUrl: string
    flow: string
    scopes: {
      'read:pets': string
      'write:pets': string
    }
  }
}
