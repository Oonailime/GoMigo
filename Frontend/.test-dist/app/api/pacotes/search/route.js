"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const backend_1 = require("../../../lib/backend");
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const response = await (0, backend_1.fetchServerBackend)(`/pacotes/search?${query}`);
    const data = await response.json();
    return server_1.NextResponse.json(data, { status: response.status });
}
