import type { ChatEntry, EnrollmentFormData, FinMateInsights } from "@/lib/types"

interface MemoryStore {
  profiles: Map<string, EnrollmentFormData>
  insights: Map<string, FinMateInsights>
  chats: Map<string, ChatEntry[]>
}

declare global {
  // eslint-disable-next-line no-var
  var __finmateStore: MemoryStore | undefined
}

export function getStore(): MemoryStore {
  if (!globalThis.__finmateStore) {
    globalThis.__finmateStore = {
      profiles: new Map(),
      insights: new Map(),
      chats: new Map(),
    }
  }
  return globalThis.__finmateStore
}
