export interface Server {
  url: string
  description: string
  variables: Record<string, Variable>
}

export interface Variable {
  enum: string[]
  default: string
  description: string
}
