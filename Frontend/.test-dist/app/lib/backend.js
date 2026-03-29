"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverBackendUrl = exports.clientBackendUrl = void 0;
exports.getBackendAuthHeaders = getBackendAuthHeaders;
exports.fetchBackend = fetchBackend;
exports.fetchBackendJson = fetchBackendJson;
exports.fetchServerBackend = fetchServerBackend;
exports.fetchServerBackendJson = fetchServerBackendJson;
exports.readApiErrorMessage = readApiErrorMessage;
exports.clientBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";
exports.serverBackendUrl = process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:3001/api";
function getBackendAuthHeaders(token, headers) {
    return {
        ...headers,
        Authorization: `Bearer ${token}`,
    };
}
async function fetchBackend(path, options = {}) {
    const { token, headers, json, ...init } = options;
    return fetch(`${exports.clientBackendUrl}${path}`, {
        ...init,
        headers: token ? getBackendAuthHeaders(token, headers) : headers,
        body: json !== undefined ? JSON.stringify(json) : init.body,
    });
}
async function fetchBackendJson(path, options = {}) {
    const response = await fetchBackend(path, options);
    const data = (await response.json().catch(() => null));
    return { response, data };
}
async function fetchServerBackend(path, options = {}) {
    const { token, headers, json, ...init } = options;
    return fetch(`${exports.serverBackendUrl}${path}`, {
        ...init,
        headers: token ? getBackendAuthHeaders(token, headers) : headers,
        body: json !== undefined ? JSON.stringify(json) : init.body,
    });
}
async function fetchServerBackendJson(path, options = {}) {
    const response = await fetchServerBackend(path, options);
    const data = (await response.json().catch(() => null));
    return { response, data };
}
async function readApiErrorMessage(response, fallback) {
    const data = (await response.json().catch(() => null));
    if (Array.isArray(data?.message)) {
        return data.message.join(", ");
    }
    return data?.message ?? fallback;
}
