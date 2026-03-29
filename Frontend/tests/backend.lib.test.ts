import test from "node:test";
import assert from "node:assert/strict";
import {
  clientBackendUrl,
  getBackendAuthHeaders,
  readApiErrorMessage,
  serverBackendUrl,
} from "../app/lib/backend";

test("backend urls fall back to localhost defaults in test environment", () => {
  assert.equal(clientBackendUrl, "http://localhost:3001/api");
  assert.equal(serverBackendUrl, "http://localhost:3001/api");
});

test("getBackendAuthHeaders merges existing headers with bearer authorization", () => {
  assert.deepEqual(
    getBackendAuthHeaders("token-123", {
      "Content-Type": "application/json",
    }),
    {
      "Content-Type": "application/json",
      Authorization: "Bearer token-123",
    },
  );
});

test("readApiErrorMessage joins array messages from API responses", async () => {
  const response = new Response(JSON.stringify({ message: ["erro 1", "erro 2"] }), {
    status: 400,
    headers: {
      "Content-Type": "application/json",
    },
  });

  assert.equal(await readApiErrorMessage(response, "fallback"), "erro 1, erro 2");
});

test("readApiErrorMessage falls back when the response is not valid JSON", async () => {
  const response = new Response("not-json", {
    status: 500,
    headers: {
      "Content-Type": "text/plain",
    },
  });

  assert.equal(await readApiErrorMessage(response, "fallback"), "fallback");
});
