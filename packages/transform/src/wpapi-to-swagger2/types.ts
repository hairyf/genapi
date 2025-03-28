/**
 * Interface for WordPress REST API route
 */
export interface WordPressRoute {
  namespace: string
  endpoints: WordPressEndpoint[]
}
export interface WordPressAPISchema {
  routes: Record<string, WordPressRoute>
}
/**
 * Interface for WordPress REST API endpoint
 */
export interface WordPressEndpoint {
  methods: ('get' | 'post' | 'put' | 'delete')[]
  description?: string
  args?: Record<string, WordPressArgument>
}

/**
 * Interface for WordPress REST API argument
 */
export interface WordPressArgument {
  type?: string | string[]
  description?: string
  required?: boolean
  enum?: string[]
  default?: any
  items?: {
    type?: string
  }
  maximum?: number
  minimum?: number
  format?: string
  schema?: any
}
