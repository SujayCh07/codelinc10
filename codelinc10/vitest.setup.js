import { afterEach, beforeEach, vi } from "vitest"

beforeEach(() => {
  const store = new Map<string, string>()

  const localStorageMock = {
    getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key)
    }),
    clear: vi.fn(() => {
      store.clear()
    }),
  }

  vi.stubGlobal("localStorage", localStorageMock)
  vi.stubGlobal(
    "window",
    {
      localStorage: localStorageMock,
    } as unknown as Window & typeof globalThis,
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})
