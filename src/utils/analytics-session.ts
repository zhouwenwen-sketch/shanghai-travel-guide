const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const memoryIds = new Map<string, string>()

function createId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16)
    return (char === 'x' ? random : (random & 0x3) | 0x8).toString(16)
  })
}

function getId(key: string, storage: Storage | undefined): string {
  try {
    const stored = storage?.getItem(key)
    if (stored && UUID_V4.test(stored)) return stored
    const next = createId()
    storage?.setItem(key, next)
    return next
  } catch {
    const existing = memoryIds.get(key)
    if (existing && UUID_V4.test(existing)) return existing
    const next = createId()
    memoryIds.set(key, next)
    return next
  }
}

function browserStorage(name: 'localStorage' | 'sessionStorage'): Storage | undefined {
  try { return typeof window === 'undefined' ? undefined : window[name] } catch { return undefined }
}

export function createHomeViewEvent() {
  return {
    eventId: createId(),
    visitorId: getId('travel-analytics-visitor', browserStorage('localStorage')),
    sessionId: getId('travel-analytics-session', browserStorage('sessionStorage')),
  }
}
