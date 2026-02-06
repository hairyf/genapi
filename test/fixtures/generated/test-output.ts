/*
 * @title Minimal API
 * @description Minimal API for testing
 * @swagger 2.0
 * @version 1.0.0
 */

import { default as http, OptionsOfTextResponseBody } from "got";

export const baseURL = "https://api.example.com/v1/";

/**
 * @summary List pets
 * @method get
 */
export async function getPets(config?: OptionsOfTextResponseBody) {
  const response = http.get("/pets", {
    prefixUrl: baseURL,
    ...config,
  });
  return response.json<void>();
}
