import type { HttpResponseInit } from "@azure/functions";

// Keep response shaping uniform across all HTTP functions.
export function jsonResponse(status: number, body: unknown): HttpResponseInit {
  return {
    status,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  };
}
