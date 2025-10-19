import { isBrowser } from "./window"

export function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`Failed to read storage key "${key}"`, error)
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`Failed to write storage key "${key}"`, error)
  }
}

export function removeStorage(key: string) {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to remove storage key "${key}"`, error)
  }
}

export function readString(key: string, fallback: string) {
  if (!isBrowser()) return fallback
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch (error) {
    console.warn(`Failed to read storage key "${key}"`, error)
    return fallback
  }
}

export function writeString(key: string, value: string) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    console.warn(`Failed to write storage key "${key}"`, error)
  }
}
