"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = exports.runtime = void 0;
const auth_1 = require("@/auth");
exports.runtime = "nodejs";
exports.GET = auth_1.handlers.GET, exports.POST = auth_1.handlers.POST;
