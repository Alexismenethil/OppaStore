import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

const storage = new Map<string, string>();

Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      storage.delete(key);
    }),
    clear: vi.fn(() => {
      storage.clear();
    }),
  },
});

Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});

beforeEach(() => {
  storage.clear();
  vi.mocked(window.localStorage.getItem).mockClear();
  vi.mocked(window.localStorage.setItem).mockClear();
  vi.mocked(window.localStorage.removeItem).mockClear();
  vi.mocked(window.localStorage.clear).mockClear();
  vi.mocked(window.scrollTo).mockClear();
});
