import type { OptionsOfJSONResponseBody } from 'got'
import type {
  StatementField,
  StatementFunction,
  StatementImported,
  StatementInterface,
  StatementResponse,
  StatementTypeAlias,
  StatementVariable,
} from './statement'

export namespace ApiPipeline {
  export interface Output {
    type: 'request' | 'typings'
    root: string
    path: string
    import?: string
    ast?: any
    code?: string
  }
  export interface Inputs {
    json?: string | Record<string, string>
    http?: OptionsOfJSONResponseBody
    uri?: string
  }
  export interface PreInputs {
    /**
     * genapi input pipe source
     * @description
     * the incoming string resolves to a uri.
     *
     * You can also pass in `{ uri }` with the same effect as above
     *
     * `{ json }` json can pass in path/object
     */
    input: string | { uri: string } | { json: string | Record<string, any> } | { http: OptionsOfJSONResponseBody }
  }
  export interface PreOutput {
    /**
     * genapi output file options
     */
    output?: string | { main?: string, type?: string | false }
  }

  export interface ResponseTypeOptions {
    /**
     * External generic type definition for js type commit
     *
     * @template `Promise<AxiosResponse<{__type__}>>`
     *
     * @default {__type__}
     */
    generic?: string
    /**
     * type conversion of response body
     *
     * @template `T extends { data?: infer V } ? V : void`
     */
    infer?: string
  }

  export interface Meta {
    /** The current interface base URL, which can be used for the definition of env variables */
    baseURL?: string | false
    /** Import type of makefile */
    import?: {
      http?: string
      type?: string
    }
    /**
     * type conversion of response body
     * @template `T extends { data?: infer V } ? V : void`
     */
    responseType?: string | ResponseTypeOptions

    /**
     * Whether to generate required response body
     *
     * @default undefined use response.required
     */
    responseRequired?: boolean
    /**
     * Whether to generate required parameters
     *
     * @default undefined use parameter.required
     */
    parametersRequired?: boolean

    /** Only generate type declaration files */
    onlyDeclaration?: boolean

    /**
     * Whether to generate mock functions using better-mock
     *
     * @default false
     */
    mockjs?: boolean
  }

  export type Operation = string | {
    name?: string
    parameters?: StatementField[]
    responseType?: string
  }
  export type Definition = string | {
    name?: string
    type?: StatementField[]
  }

  export interface Patch {
    /**
     * @example
     * {
     *    // change name to updateUserInfo
     *    postUpdateUserUsingPOST: 'updateUserInfo',
     *    // change parameters and name
     *   'getUserUsingGET_1': {
     *     name: 'getUser',
     *     parameters: [
     *       { name: 'id', type: 'string' }
     *     ]
     *   }
     * }
     */
    operations?: Record<string, Operation>
    /**
     * @example
     * {
     *    // rename type
     *   'UserDto': 'User',
     *   'OrderDto': 'Order',
     *   // change type
     *   'SessionDto': {
     *     name: 'Session',
     *     type: '{ name: string, age: number }',
     *   }
     * }
     */
    definitions?: Record<string, Definition>
  }

  export interface Transform {
    /**
     * @description
     * Transform the operation
     */
    operation?: (name: string, parameters: StatementField[], responseType: string) => Operation
    /**
     * @description
     * Transform the definition type
     */
    definition?: (name: string, type: StatementField[]) => Definition
  }

  export interface Config extends PreInputs, PreOutput, Meta {
    /**
     * @description
     * Static patches: exact match modification
     */
    patch?: Patch

    /**
     * @description
     * Transform the operation and definition
     */
    transform?: Transform
    /**
     * The compilation pipeline used supports npm package (add the prefix @genapi/ or genapi-) | local path
     * @default 'swag-axios-ts'
     */
    pipeline?: string | ApiPipeline.Pipeline
  }

  export interface Graphs {
    /**
     * all comments
     */
    comments: string[]

    /**
     * all api options
     */
    functions: StatementFunction[]
    /**
     * all request imports
     */
    imports: StatementImported[]

    /**
     * all request variables
     */
    variables: StatementVariable[]
    /**
     * all request typings
     */
    typings: StatementTypeAlias[]
    /**
     * all request interfaces
     */
    interfaces: StatementInterface[]

    response: StatementResponse
  }
  export interface ConfigRead<Config = ApiPipeline.Config> {
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

    [key: string]: any
  }
  export interface ConfigServers extends Omit<Config, 'input' | 'output'> {
    servers: Config[]
  }
  export type DefineConfig = ConfigServers | Config

  export type Pipeline = (config: ApiPipeline.Config) => Promise<void>
}
