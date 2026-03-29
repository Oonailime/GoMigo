"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const backend_1 = require("../app/lib/backend");
(0, node_test_1.default)("backend urls fall back to localhost defaults in test environment", () => {
    strict_1.default.equal(backend_1.clientBackendUrl, "http://localhost:3001/api");
    strict_1.default.equal(backend_1.serverBackendUrl, "http://localhost:3001/api");
});
(0, node_test_1.default)("getBackendAuthHeaders merges existing headers with bearer authorization", () => {
    strict_1.default.deepEqual((0, backend_1.getBackendAuthHeaders)("token-123", {
        "Content-Type": "application/json",
    }), {
        "Content-Type": "application/json",
        Authorization: "Bearer token-123",
    });
});
(0, node_test_1.default)("readApiErrorMessage joins array messages from API responses", async () => {
    const response = new Response(JSON.stringify({ message: ["erro 1", "erro 2"] }), {
        status: 400,
        headers: {
            "Content-Type": "application/json",
        },
    });
    strict_1.default.equal(await (0, backend_1.readApiErrorMessage)(response, "fallback"), "erro 1, erro 2");
});
(0, node_test_1.default)("readApiErrorMessage falls back when the response is not valid JSON", async () => {
    const response = new Response("not-json", {
        status: 500,
        headers: {
            "Content-Type": "text/plain",
        },
    });
    strict_1.default.equal(await (0, backend_1.readApiErrorMessage)(response, "fallback"), "fallback");
});
