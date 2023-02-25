import type { StatementFunction, StatementImported, StatementInterface, StatementTypeAlias, StatementVariable } from './statement'

namespace ApiPipeline {
  export interface Output {
    type: 'request' | 'typings'
    root: string
    path: string
    import?: string
    ast?: any
    code?: string
  }
  export interface Inputs {
    json?: Record<string, string>
    uri?: string
  }
  export interface PreInputs {
    /**
     * apipgen input pipe source
     * @description
     * the incoming string resolves to a uri.
     *
     * You can also pass in `{ uri }` with the same effect as above
     *
     * `{ json }` json can pass in path/object
     */
    input: string | { uri: string } | { json: string | Record<string, string> }
  }
  export interface PreOutput {
    /**
     * apipgen output file options
     */
    output?: {
      main?: string
      type?: string | false
    }
  }

  export interface Meta {
    /** The current interface base URL, which can be used for the definition of env variables */
    baseURL?: string
    /** Import type of makefile */
    import?: {
      http?: string
      type?: string
    }
    /**
     * Type conversion of response body
     * @template `T extends { data?: infer V } ? V : void`
     */
    responseType?: string
    /** Mandatory parameters optional */
    paramsPartial?: boolean
  }

  export interface Config extends PreInputs, PreOutput, Meta {
    /**
     * The compilation pipeline used supports npm package (add the prefix apipgen -) | local path
     * @default 'swag-ts-axios'
     */
    pipeline?: string
  }

  export interface Graphs {

    /**
     * all comments
     */
    comments?: string[]

    /**
     * all api options
     */
    functions?: StatementFunction[]
    /**
     * all request imports
     */
    imports?: StatementImported[]

    /**
     * all request variables
     */
    variables?: StatementVariable[]
    /**
     * all request typings
     */
    typings?: StatementTypeAlias[]
    /**
     * all request interfaces
     */
    interfaces?: StatementInterface[]
  }
  export interface ConfigRead {
    /**
     * source input
     */
    inputs: Inputs
    /**
     * source config
     */
    config: Config
    /**
     *  graphs
     */
    graphs: Graphs
    /**
     * output configs
     */
    outputs: Output[]
    /**
     * source data
     */
    source?: any

  }
  export interface ConfigServers extends Omit<Config, 'input' | 'output'> {
    servers: Config[]
  }
  export type DefineConfig = ConfigServers | Config

  export type Pipeline = (config: ApiPipeline.Config) => Promise<void>
}

export type { ApiPipeline }
export type { StatementField, StatementFunction, StatementImported, StatementInterface, StatementTypeAlias, StatementVariable } from './statement'

export default ApiPipeline
