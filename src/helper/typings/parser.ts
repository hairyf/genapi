import { OpenAPIBuildConfiguration } from './generator';
import { MethodStatementFunction } from './method'
import { StatementFunction, StatementImported, StatementInterface, StatementTypeAlias, StatementVariable } from './statement';

export * from './method'

export interface StatementParseConfig {
  /**
   * config parser source
   */
  config: OpenAPIBuildConfiguration
  /**
   * all api options
   */
  functions?: StatementFunction
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
