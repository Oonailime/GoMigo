import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  SEARCH_STORAGE_KEY,
  defaultSearchDraft,
  readSearchDraft,
  writeSearchDraft,
} from "../app/data/search-storage";

type LocalStorageMock = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

const originalWindow = globalThis.window;

function installWindow(storage: Map<string, string>) {
  const localStorage: LocalStorageMock = {
    getItem(key) {
      return storage.has(key) ? storage.get(key)! : null;
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

afterEach(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
  });
});

test("readSearchDraft returns null when window is unavailable", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: undefined,
  });

  assert.equal(readSearchDraft(), null);
});

test("writeSearchDraft persists the draft in localStorage", () => {
  const storage = new Map<string, string>();
  installWindow(storage);

  writeSearchDraft(defaultSearchDraft);

  assert.equal(storage.get(SEARCH_STORAGE_KEY), JSON.stringify(defaultSearchDraft));
});

test("readSearchDraft returns the stored draft", () => {
  const storage = new Map<string, string>([
    [SEARCH_STORAGE_KEY, JSON.stringify(defaultSearchDraft)],
  ]);
  installWindow(storage);

  assert.deepEqual(readSearchDraft(), defaultSearchDraft);
});

test("readSearchDraft returns null for malformed JSON", () => {
  const storage = new Map<string, string>([[SEARCH_STORAGE_KEY, "{invalid-json"]]);
  installWindow(storage);

  assert.equal(readSearchDraft(), null);
});
