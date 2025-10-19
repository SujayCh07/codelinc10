import { describe, expect, it, vi } from "vitest"

import { readStorage, readString, removeStorage, writeStorage, writeString } from "@/lib/storage"

const KEY = "test-key"

describe("storage utilities", () => {
  it("writes and reads structured data", () => {
    const payload = { foo: "bar", count: 2 }
    writeStorage(KEY, payload)

    expect(window.localStorage.setItem).toHaveBeenCalledWith(KEY, JSON.stringify(payload))

    const value = readStorage(KEY, null as typeof payload | null)
    expect(value).toEqual(payload)
  })

  it("removes stored values when asked", () => {
    writeStorage(KEY, { value: "keep" })
    removeStorage(KEY)

    expect(window.localStorage.removeItem).toHaveBeenCalledWith(KEY)
    const restored = readStorage(KEY, { fallback: true })
    expect(restored).toEqual({ fallback: true })
  })

  it("handles raw string helpers", () => {
    writeString(KEY, "hello")
    expect(window.localStorage.setItem).toHaveBeenCalledWith(KEY, "hello")
    expect(readString(KEY, "fallback")).toBe("hello")

    vi.mocked(window.localStorage.getItem).mockReturnValueOnce(null)
    expect(readString(KEY, "fallback")).toBe("fallback")
  })
})
