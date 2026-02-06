/*
 * @title Minimal API
 * @description Minimal API for testing
 * @swagger 2.0
 * @version 1.0.0
 */

import type { UnConfig } from '@uni-helper/uni-network'
import http from '@uni-helper/uni-network'

export const baseURL = 'https://api.example.com/v1/'

/**
 * @summary List pets
 * @method get
 */
export function getPets(config?: UnConfig<never>) {
  const url = '/pets'
  return http.request<void>({ baseURL, method: 'get', url, ...config })
}
