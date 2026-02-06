/*
 * @title Minimal API
 * @description Minimal API for testing
 * @swagger 2.0
 * @version 1.0.0
 */

import { ofetch } from "ofetch";

export const baseURL = "https://api.example.com/v1/";

/**
 * @summary List pets
 * @method get
 * @param {import('ofetch').FetchOptions=} options
 * @return {Promise<void>}
 */
export async function getPets(options) {
  return ofetch(`${baseURL}/pets`, { baseURL, method: "get", ...options });
}
