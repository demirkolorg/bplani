// Tab sistemi type tanımları

export interface Tab {
  id: string
  path: string
  title: string
  icon?: string
  scrollPosition: number
  openedAt: number
  lastActiveAt: number
  isDynamic?: boolean  // Dinamik başlık (kişi adı gibi) - locale değişiminde korunur
}

export interface TabState {
  tabs: Tab[]
  activeTabId: string | null
  maxTabs: number
}

export interface OpenTabOptions {
  replace?: boolean      // Mevcut tab'ı değiştir
  focus?: boolean        // Tab'a focus ol (varsayılan: true)
  background?: boolean   // Arka planda aç (Ctrl+click)
}

export interface TabContextType {
  // State
  tabs: Tab[]
  activeTabId: string | null
  activeTab: Tab | null
  mounted: boolean

  // Actions
  openTab: (path: string, options?: OpenTabOptions) => void
  closeTab: (tabId: string) => void
  closeOtherTabs: (tabId: string) => void
  closeAllTabs: () => void
  closeTabsToRight: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabTitle: (tabId: string, title: string, isDynamic?: boolean) => void
  updateTabIcon: (tabId: string, icon: string) => void
  updateScrollPosition: (tabId: string, position: number) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  getTabByPath: (path: string) => Tab | undefined
}

// Reducer action types
export type TabAction =
  | { type: "OPEN_TAB"; payload: { path: string; title: string; icon?: string; options?: OpenTabOptions } }
  | { type: "CLOSE_TAB"; payload: { tabId: string } }
  | { type: "CLOSE_OTHER_TABS"; payload: { tabId: string } }
  | { type: "CLOSE_TABS_TO_RIGHT"; payload: { tabId: string } }
  | { type: "CLOSE_ALL_TABS" }
  | { type: "SET_ACTIVE"; payload: { tabId: string } }
  | { type: "UPDATE_TITLE"; payload: { tabId: string; title: string; isDynamic?: boolean } }
  | { type: "UPDATE_ICON"; payload: { tabId: string; icon: string } }
  | { type: "UPDATE_SCROLL"; payload: { tabId: string; position: number } }
  | { type: "REORDER"; payload: { fromIndex: number; toIndex: number } }
  | { type: "HYDRATE"; payload: TabState }

// localStorage için persist edilecek state
export interface PersistedTabState {
  version: number
  tabs: PersistedTab[]
  activeTabId: string | null
}

export interface PersistedTab {
  id: string
  path: string
  title: string
  icon?: string
  scrollPosition: number
  openedAt: number
  isDynamic?: boolean
}
