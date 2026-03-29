"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importStar(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const search_storage_1 = require("../app/data/search-storage");
const originalWindow = globalThis.window;
function installWindow(storage) {
    const localStorage = {
        getItem(key) {
            return storage.has(key) ? storage.get(key) : null;
        },
        setItem(key, value) {
            storage.set(key, value);
        },
    };
    Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: {
            localStorage,
        },
    });
}
(0, node_test_1.afterEach)(() => {
    Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
    });
});
(0, node_test_1.default)("readSearchDraft returns null when window is unavailable", () => {
    Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: undefined,
    });
    strict_1.default.equal((0, search_storage_1.readSearchDraft)(), null);
});
(0, node_test_1.default)("writeSearchDraft persists the draft in localStorage", () => {
    const storage = new Map();
    installWindow(storage);
    (0, search_storage_1.writeSearchDraft)(search_storage_1.defaultSearchDraft);
    strict_1.default.equal(storage.get(search_storage_1.SEARCH_STORAGE_KEY), JSON.stringify(search_storage_1.defaultSearchDraft));
});
(0, node_test_1.default)("readSearchDraft returns the stored draft", () => {
    const storage = new Map([
        [search_storage_1.SEARCH_STORAGE_KEY, JSON.stringify(search_storage_1.defaultSearchDraft)],
    ]);
    installWindow(storage);
    strict_1.default.deepEqual((0, search_storage_1.readSearchDraft)(), search_storage_1.defaultSearchDraft);
});
(0, node_test_1.default)("readSearchDraft returns null for malformed JSON", () => {
    const storage = new Map([[search_storage_1.SEARCH_STORAGE_KEY, "{invalid-json"]]);
    installWindow(storage);
    strict_1.default.equal((0, search_storage_1.readSearchDraft)(), null);
});
