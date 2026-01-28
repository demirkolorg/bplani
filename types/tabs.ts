// Tab sistemi type tanımları

export interface TabGroup {
  id: string
  name: string
  color: string  // Tailwind color class (e.g., "blue", "green", "red")
}

export interface TabSession {
  id: string
  name: string
  tabs: PersistedTab[]
  createdAt: number
}

export interface Tab {
  id: string
  path: string
  title: string
  icon?: string
  scrollPosition: number
  openedAt: number
  lastActiveAt: number
  isDynamic?: boolean  // Dinamik başlık (kişi adı gibi) - locale değişiminde korunur
  isPinned?: boolean   // Pinlenmiş tab (kapatılamaz, her zaman solda)
  groupId?: string     // Tab grubu ID'si
  isDirty?: boolean    // Kaydedilmemiş değişiklik var mı
}

export type SplitOrientation = "horizontal" | "vertical"

export interface TabState {
  tabs: Tab[]
  activeTabId: string | null
  activeTabHistory: string[] // Gezinme geçmişi (en son aktif olan en sonda)
  closedTabHistory: Tab[] // Kapatılan tab'lar (son 10 tab)
  groups: TabGroup[] // Tab grupları
  sessions: TabSession[] // Kaydedilmiş session'lar
  splitActive: boolean // Split mode aktif mi
  splitPrimaryTabId: string | null // Sol/üst bölmedeki tab
  splitSecondaryTabId: string | null // Sağ/alt bölmedeki tab (null ise seçici göster)
  splitOrientation: SplitOrientation // Yatay mı dikey mi
  maxTabs: number
}

export interface OpenTabOptions {
  replace?: boolean      // Mevcut tab'ı değiştir
  focus?: boolean        // Tab'a focus ol (varsayılan: true)
  background?: boolean   // Arka planda aç (Ctrl+click)
  duplicate?: boolean    // Aynı path'te bile yeni tab aç
}

export interface TabContextType {
  // State
  tabs: Tab[]
  activeTabId: string | null
  activeTab: Tab | null
  mounted: boolean
  closedTabHistory: Tab[]
  groups: TabGroup[]
  sessions: TabSession[]
  splitActive: boolean
  splitPrimaryTabId: string | null
  splitSecondaryTabId: string | null
  splitOrientation: SplitOrientation

  // Actions
  openTab: (path: string, options?: OpenTabOptions) => void
  closeTab: (tabId: string) => void
  closeOtherTabs: (tabId: string) => void
  closeAllTabs: () => void
  closeAllExceptHome: () => void
  closeTabsToRight: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  updateTabTitle: (tabId: string, title: string, isDynamic?: boolean) => void
  updateTabIcon: (tabId: string, icon: string) => void
  updateScrollPosition: (tabId: string, position: number) => void
  setTabDirty: (tabId: string, isDirty: boolean) => void
  reorderTabs: (fromIndex: number, toIndex: number) => void
  reopenLastClosedTab: () => void
  pinTab: (tabId: string) => void
  unpinTab: (tabId: string) => void
  createGroup: (name: string, color: string) => string
  updateGroup: (groupId: string, name?: string, color?: string) => void
  deleteGroup: (groupId: string) => void
  assignTabToGroup: (tabId: string, groupId: string | null) => void
  saveSession: (name: string) => string
  loadSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void
  startSplitView: (tabId: string, orientation: SplitOrientation) => void
  selectSplitTab: (tabId: string) => void
  closeSplitView: () => void
  getTabByPath: (path: string) => Tab | undefined
}

// Reducer action types
export type TabAction =
  | { type: "OPEN_TAB"; payload: { path: string; title: string; icon?: string; options?: OpenTabOptions } }
  | { type: "CLOSE_TAB"; payload: { tabId: string } }
  | { type: "CLOSE_OTHER_TABS"; payload: { tabId: string } }
  | { type: "CLOSE_TABS_TO_RIGHT"; payload: { tabId: string } }
  | { type: "CLOSE_ALL_TABS" }
  | { type: "CLOSE_ALL_EXCEPT_HOME" }
  | { type: "SET_ACTIVE"; payload: { tabId: string } }
  | { type: "UPDATE_TITLE"; payload: { tabId: string; title: string; isDynamic?: boolean } }
  | { type: "UPDATE_ICON"; payload: { tabId: string; icon: string } }
  | { type: "UPDATE_SCROLL"; payload: { tabId: string; position: number } }
  | { type: "SET_TAB_DIRTY"; payload: { tabId: string; isDirty: boolean } }
  | { type: "REORDER"; payload: { fromIndex: number; toIndex: number } }
  | { type: "REOPEN_LAST_CLOSED_TAB" }
  | { type: "PIN_TAB"; payload: { tabId: string } }
  | { type: "UNPIN_TAB"; payload: { tabId: string } }
  | { type: "CREATE_GROUP"; payload: { groupId: string; name: string; color: string } }
  | { type: "UPDATE_GROUP"; payload: { groupId: string; name?: string; color?: string } }
  | { type: "DELETE_GROUP"; payload: { groupId: string } }
  | { type: "ASSIGN_TAB_TO_GROUP"; payload: { tabId: string; groupId: string | null } }
  | { type: "SAVE_SESSION"; payload: { sessionId: string; name: string } }
  | { type: "LOAD_SESSION"; payload: { sessionId: string } }
  | { type: "DELETE_SESSION"; payload: { sessionId: string } }
  | { type: "START_SPLIT_VIEW"; payload: { tabId: string; orientation: SplitOrientation } }
  | { type: "SELECT_SPLIT_TAB"; payload: { tabId: string } }
  | { type: "CLOSE_SPLIT_VIEW" }
  | { type: "HYDRATE"; payload: TabState }

// localStorage için persist edilecek state
export interface PersistedTabState {
  version: number
  tabs: PersistedTab[]
  activeTabId: string | null
  groups?: TabGroup[] // Optional for backwards compatibility
  sessions?: TabSession[] // Optional for backwards compatibility
}

export interface PersistedTab {
  id: string
  path: string
  title: string
  icon?: string
  scrollPosition: number
  openedAt: number
  isDynamic?: boolean
  isPinned?: boolean
  groupId?: string
}
