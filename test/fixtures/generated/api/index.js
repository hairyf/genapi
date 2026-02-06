/*
 * @title Minimal API
 * @description Minimal API for testing
 * @swagger 2.0
 * @version 1.0.0
 */

import http from '@uni-helper/uni-network'

export const baseURL = 'https://api.example.com/v1/'

/**
 * @summary List pets
 * @method get
 * @param {import('@uni-helper/uni-network').UnConfig<never>=} config
 * @return {import('@uni-helper/uni-network').UnResponse<void>}
 */
export function getPets(config) {
  const url = '/pets'
  return http.request({ baseURL, method: 'get', url, ...config })
}
