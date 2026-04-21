export interface UserSettings {
  showOverviewTab: boolean
  showPersonalityTab: boolean
  showTimelineTab: boolean
  showNewsTab: boolean
  showWorkTab: boolean
  showResourcesTab: boolean
  showChatTab: boolean
  defaultWebSearch: boolean
  defaultKnowledgeBase: boolean
}

export const USER_SETTINGS_STORAGE_KEY = "mimic.user-settings.v1"

export const DEFAULT_USER_SETTINGS: UserSettings = {
  showOverviewTab: true,
  showPersonalityTab: true,
  showTimelineTab: true,
  showNewsTab: true,
  showWorkTab: true,
  showResourcesTab: true,
  showChatTab: true,
  defaultWebSearch: false,
  defaultKnowledgeBase: true,
}

export function readUserSettings(): UserSettings {
  if (typeof globalThis === "undefined" || !globalThis.localStorage) {
    return DEFAULT_USER_SETTINGS
  }

  try {
    const raw = globalThis.localStorage.getItem(USER_SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_USER_SETTINGS

    const parsed = JSON.parse(raw) as Partial<UserSettings>
    return {
      ...DEFAULT_USER_SETTINGS,
      ...parsed,
    }
  } catch {
    return DEFAULT_USER_SETTINGS
  }
}

export function writeUserSettings(next: UserSettings) {
  if (typeof globalThis === "undefined" || !globalThis.localStorage) return
  globalThis.localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(next))
}
