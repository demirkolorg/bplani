"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import type {
  Tab,
  TabState,
  TabAction,
  TabContextType,
  OpenTabOptions,
  PersistedTabState,
  SplitOrientation,
  TabGroup,
  TabSession,
} from "@/types/tabs"
import { getRouteTitle, getRouteIcon, getRouteTitleKey } from "@/lib/tab-config"
import { useLocale } from "@/components/providers/locale-provider"

const TAB_STORAGE_KEY = "altay_tabs_state"
const TAB_STORAGE_VERSION = 1
const DEFAULT_MAX_TABS = 15

// Initial state
const initialState: TabState = {
  tabs: [],
  activeTabId: null,
  activeTabHistory: [],
  closedTabHistory: [],
  groups: [],
  sessions: [],
  splitActive: false,
  splitPrimaryTabId: null,
  splitSecondaryTabId: null,
  splitOrientation: "horizontal",
  maxTabs: DEFAULT_MAX_TABS,
}

// Reducer
function tabReducer(state: TabState, action: TabAction): TabState {
  switch (action.type) {
    case "OPEN_TAB": {
      const { path, title, icon, options } = action.payload
      const existingTab = state.tabs.find((t) => t.path === path)

      // Zaten açık - focus ol (duplicate flag yoksa)
      if (existingTab && !options?.duplicate) {
        if (options?.background) {
          return state // Background'da açılıyorsa active değiştirme
        }
        // History'yi güncelle
        const newHistory = state.activeTabHistory.filter((id) => id !== existingTab.id)
        if (state.activeTabId) {
          newHistory.push(state.activeTabId)
        }
        return {
          ...state,
          activeTabId: existingTab.id,
          activeTabHistory: newHistory,
          tabs: state.tabs.map((t) =>
            t.id === existingTab.id ? { ...t, lastActiveAt: Date.now() } : t
          ),
        }
      }

      // Yeni tab oluştur
      const newTab: Tab = {
        id: uuidv4(),
        path,
        title,
        icon,
        scrollPosition: 0,
        openedAt: Date.now(),
        lastActiveAt: Date.now(),
        isPinned: path === "/" ? true : undefined, // Ana sayfa her zaman pinli
      }

      // Yeni tab'ı aktif tabın yanına ekle
      let newTabs: Tab[]
      if (state.activeTabId) {
        const activeIndex = state.tabs.findIndex((t) => t.id === state.activeTabId)
        if (activeIndex !== -1) {
          // Aktif tab'ın hemen sağına ekle
          newTabs = [
            ...state.tabs.slice(0, activeIndex + 1),
            newTab,
            ...state.tabs.slice(activeIndex + 1),
          ]
        } else {
          // Aktif tab bulunamazsa sona ekle
          newTabs = [...state.tabs, newTab]
        }
      } else {
        // Hiç aktif tab yoksa sona ekle
        newTabs = [...state.tabs, newTab]
      }

      // Max tab kontrolü - en eski kullanılmayanı kaldır (ana sayfa hariç)
      if (newTabs.length > state.maxTabs) {
        const sortedByLastActive = [...newTabs]
          .filter((t) => t.path !== "/") // Ana sayfa korunur
          .sort((a, b) => a.lastActiveAt - b.lastActiveAt)
        if (sortedByLastActive.length > 0) {
          const tabToRemove = sortedByLastActive[0]
          newTabs = newTabs.filter((t) => t.id !== tabToRemove.id)
        }
      }

      // History'yi güncelle (background değilse)
      let newHistory = [...state.activeTabHistory]
      if (!options?.background && state.activeTabId) {
        newHistory.push(state.activeTabId)
      }

      return {
        ...state,
        tabs: newTabs,
        activeTabId: options?.background ? state.activeTabId : newTab.id,
        activeTabHistory: newHistory,
      }
    }

    case "CLOSE_TAB": {
      const { tabId } = action.payload
      const tab = state.tabs.find((t) => t.id === tabId)

      // Pinli tab'lar kapatılamaz
      if (!tab || tab.isPinned) return state

      const newTabs = state.tabs.filter((t) => t.id !== tabId)

      // Kapatılan tab'ı closedTabHistory'ye ekle (son 10 tab)
      const newClosedHistory = [...state.closedTabHistory, tab].slice(-10)

      // History'den de kaldır
      const newHistory = state.activeTabHistory.filter((id) => id !== tabId)

      // Aktif tab kapatılıyorsa yeni aktif seç
      let newActiveId = state.activeTabId
      if (state.activeTabId === tabId) {
        if (newTabs.length === 0) {
          newActiveId = null
        } else {
          // History'den geriye doğru giderek ilk geçerli tab'ı bul
          let foundPreviousTab = false
          for (let i = newHistory.length - 1; i >= 0; i--) {
            const historyTabId = newHistory[i]
            if (newTabs.some((t) => t.id === historyTabId)) {
              newActiveId = historyTabId
              foundPreviousTab = true
              break
            }
          }

          // History'de geçerli tab bulunamadıysa, ilk tab'a git
          if (!foundPreviousTab) {
            newActiveId = newTabs[0].id
          }
        }
      }

      return {
        ...state,
        tabs: newTabs,
        activeTabId: newActiveId,
        activeTabHistory: newHistory,
        closedTabHistory: newClosedHistory,
      }
    }

    case "CLOSE_OTHER_TABS": {
      const { tabId } = action.payload
      const tab = state.tabs.find((t) => t.id === tabId)
      if (!tab) return state

      // Ana sayfa tabını koru
      const homeTab = state.tabs.find((t) => t.path === "/")
      const tabsToKeep = homeTab && homeTab.id !== tabId
        ? [homeTab, tab]
        : [tab]

      // History'yi temizle, sadece kalan tabları tut
      const keptTabIds = tabsToKeep.map((t) => t.id)
      const newHistory = state.activeTabHistory.filter((id) => keptTabIds.includes(id))

      return {
        ...state,
        tabs: tabsToKeep,
        activeTabId: tabId,
        activeTabHistory: newHistory,
      }
    }

    case "CLOSE_TABS_TO_RIGHT": {
      const { tabId } = action.payload
      const tabIndex = state.tabs.findIndex((t) => t.id === tabId)
      if (tabIndex === -1) return state

      // Ana sayfa her zaman kalır
      const newTabs = state.tabs.filter((t, i) => i <= tabIndex || t.path === "/")
      const activeStillExists = newTabs.some((t) => t.id === state.activeTabId)

      // History'yi temizle, sadece kalan tabları tut
      const keptTabIds = newTabs.map((t) => t.id)
      const newHistory = state.activeTabHistory.filter((id) => keptTabIds.includes(id))

      return {
        ...state,
        tabs: newTabs,
        activeTabId: activeStillExists ? state.activeTabId : tabId,
        activeTabHistory: newHistory,
      }
    }

    case "CLOSE_ALL_TABS": {
      return {
        ...state,
        tabs: [],
        activeTabId: null,
        activeTabHistory: [],
      }
    }

    case "CLOSE_ALL_EXCEPT_HOME": {
      // Ana sayfa hariç tüm tableri kapat
      const homeTab = state.tabs.find((t) => t.path === "/")
      if (!homeTab) {
        return {
          ...state,
          tabs: [],
          activeTabId: null,
          activeTabHistory: [],
        }
      }
      return {
        ...state,
        tabs: [homeTab],
        activeTabId: homeTab.id,
        activeTabHistory: [],
      }
    }

    case "SET_ACTIVE": {
      const { tabId } = action.payload
      const tab = state.tabs.find((t) => t.id === tabId)
      if (!tab) return state

      // History'yi güncelle
      const newHistory = state.activeTabHistory.filter((id) => id !== tabId)
      if (state.activeTabId) {
        newHistory.push(state.activeTabId)
      }

      return {
        ...state,
        activeTabId: tabId,
        activeTabHistory: newHistory,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, lastActiveAt: Date.now() } : t
        ),
      }
    }

    case "UPDATE_TITLE": {
      const { tabId, title, isDynamic } = action.payload
      // Ana sayfa başlığı değiştirilemez
      const tab = state.tabs.find((t) => t.id === tabId)
      if (tab?.path === "/") return state

      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId
            ? { ...t, title, isDynamic: isDynamic !== undefined ? isDynamic : t.isDynamic }
            : t
        ),
      }
    }

    case "UPDATE_ICON": {
      const { tabId, icon } = action.payload
      return {
        ...state,
        tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, icon } : t)),
      }
    }

    case "UPDATE_SCROLL": {
      const { tabId, position } = action.payload
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, scrollPosition: position } : t
        ),
      }
    }

    case "SET_TAB_DIRTY": {
      const { tabId, isDirty } = action.payload
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, isDirty } : t
        ),
      }
    }

    case "REORDER": {
      const { fromIndex, toIndex } = action.payload

      // Ana sayfa tabı (path === "/") taşınamaz
      const homeTab = state.tabs[0]
      if (homeTab?.path === "/" && (fromIndex === 0 || toIndex === 0)) {
        return state
      }

      const newTabs = [...state.tabs]
      const [movedTab] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, movedTab)
      return { ...state, tabs: newTabs }
    }

    case "REOPEN_LAST_CLOSED_TAB": {
      // Kapatılan tab history'si boşsa işlem yapma
      if (state.closedTabHistory.length === 0) return state

      // Son kapatılan tab'ı al
      const lastClosedTab = state.closedTabHistory[state.closedTabHistory.length - 1]
      const newClosedHistory = state.closedTabHistory.slice(0, -1)

      // Aynı path'te tab zaten açıksa sadece focus ol
      const existingTab = state.tabs.find((t) => t.path === lastClosedTab.path)
      if (existingTab) {
        const newHistory = state.activeTabHistory.filter((id) => id !== existingTab.id)
        if (state.activeTabId) {
          newHistory.push(state.activeTabId)
        }
        return {
          ...state,
          activeTabId: existingTab.id,
          activeTabHistory: newHistory,
          closedTabHistory: newClosedHistory,
        }
      }

      // Yeni tab olarak ekle (yeni ID ile)
      const reopenedTab: Tab = {
        ...lastClosedTab,
        id: uuidv4(), // Yeni ID
        openedAt: Date.now(),
        lastActiveAt: Date.now(),
      }

      // Aktif tab'ın yanına ekle
      let newTabs: Tab[]
      if (state.activeTabId) {
        const activeIndex = state.tabs.findIndex((t) => t.id === state.activeTabId)
        if (activeIndex !== -1) {
          newTabs = [
            ...state.tabs.slice(0, activeIndex + 1),
            reopenedTab,
            ...state.tabs.slice(activeIndex + 1),
          ]
        } else {
          newTabs = [...state.tabs, reopenedTab]
        }
      } else {
        newTabs = [...state.tabs, reopenedTab]
      }

      // History'yi güncelle
      let newHistory = [...state.activeTabHistory]
      if (state.activeTabId) {
        newHistory.push(state.activeTabId)
      }

      return {
        ...state,
        tabs: newTabs,
        activeTabId: reopenedTab.id,
        activeTabHistory: newHistory,
        closedTabHistory: newClosedHistory,
      }
    }

    case "PIN_TAB": {
      const { tabId } = action.payload
      const tab = state.tabs.find((t) => t.id === tabId)
      if (!tab || tab.isPinned) return state

      // Tab'ı pinle
      const pinnedTab = { ...tab, isPinned: true }
      const otherTabs = state.tabs.filter((t) => t.id !== tabId)

      // Ana sayfa (path === "/") varsa ayır
      const homeTab = otherTabs.find((t) => t.path === "/")
      const nonHomeTabs = otherTabs.filter((t) => t.path !== "/")

      // Pinli tab'ları (ana sayfa hariç) ve unpinli tab'ları ayır
      const pinnedTabs = nonHomeTabs.filter((t) => t.isPinned)
      const unpinnedTabs = nonHomeTabs.filter((t) => !t.isPinned)

      // Ana sayfa en başta, sonra pinli tab'lar, sonra unpinli tab'lar
      return {
        ...state,
        tabs: homeTab
          ? [homeTab, ...pinnedTabs, pinnedTab, ...unpinnedTabs]
          : [...pinnedTabs, pinnedTab, ...unpinnedTabs],
      }
    }

    case "UNPIN_TAB": {
      const { tabId } = action.payload
      const tab = state.tabs.find((t) => t.id === tabId)
      if (!tab || !tab.isPinned) return state

      // Ana sayfa (path === "/") unpinlenemez
      if (tab.path === "/") return state

      // Tab'ı unpin et
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, isPinned: false } : t
        ),
      }
    }

    case "CREATE_GROUP": {
      const { groupId, name, color } = action.payload
      const newGroup: TabGroup = {
        id: groupId,
        name,
        color,
      }
      return {
        ...state,
        groups: [...state.groups, newGroup],
      }
    }

    case "UPDATE_GROUP": {
      const { groupId, name, color } = action.payload
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === groupId
            ? { ...g, ...(name !== undefined && { name }), ...(color !== undefined && { color }) }
            : g
        ),
      }
    }

    case "DELETE_GROUP": {
      const { groupId } = action.payload
      // Grup silindiğinde, o gruptaki tab'ların groupId'sini null yap
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== groupId),
        tabs: state.tabs.map((t) =>
          t.groupId === groupId ? { ...t, groupId: undefined } : t
        ),
      }
    }

    case "ASSIGN_TAB_TO_GROUP": {
      const { tabId, groupId } = action.payload
      return {
        ...state,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, groupId: groupId || undefined } : t
        ),
      }
    }

    case "SAVE_SESSION": {
      const { sessionId, name } = action.payload
      const newSession: TabSession = {
        id: sessionId,
        name,
        tabs: state.tabs.map((t) => ({
          id: t.id,
          path: t.path,
          title: t.title,
          icon: t.icon,
          scrollPosition: t.scrollPosition,
          openedAt: t.openedAt,
          isDynamic: t.isDynamic,
          isPinned: t.isPinned,
          groupId: t.groupId,
        })),
        createdAt: Date.now(),
      }
      return {
        ...state,
        sessions: [...state.sessions, newSession],
      }
    }

    case "LOAD_SESSION": {
      const { sessionId } = action.payload
      const session = state.sessions.find((s) => s.id === sessionId)
      if (!session) return state

      // Session'daki tab'ları yükle
      const loadedTabs: Tab[] = session.tabs.map((t) => ({
        ...t,
        lastActiveAt: Date.now(),
      }))

      return {
        ...state,
        tabs: loadedTabs,
        activeTabId: loadedTabs.length > 0 ? loadedTabs[0].id : null,
        activeTabHistory: [],
      }
    }

    case "DELETE_SESSION": {
      const { sessionId } = action.payload
      return {
        ...state,
        sessions: state.sessions.filter((s) => s.id !== sessionId),
      }
    }

    case "START_SPLIT_VIEW": {
      const { tabId, orientation } = action.payload
      const tab = state.tabs.find((t) => t.id === tabId)
      if (!tab) return state

      return {
        ...state,
        splitActive: true,
        splitPrimaryTabId: tabId,
        splitSecondaryTabId: null, // null = seçici göster
        splitOrientation: orientation,
      }
    }

    case "SELECT_SPLIT_TAB": {
      const { tabId } = action.payload
      const tab = state.tabs.find((t) => t.id === tabId)
      if (!tab || !state.splitActive) return state

      return {
        ...state,
        splitSecondaryTabId: tabId,
      }
    }

    case "CLOSE_SPLIT_VIEW": {
      return {
        ...state,
        splitActive: false,
        splitPrimaryTabId: null,
        splitSecondaryTabId: null,
      }
    }

    case "HYDRATE": {
      return {
        ...action.payload,
        activeTabHistory: [], // History restore edilmez, boş başlar
        closedTabHistory: [], // Closed tab history restore edilmez, boş başlar
        groups: action.payload.groups || [], // Groups restore edilir
        sessions: action.payload.sessions || [], // Sessions restore edilir
        splitActive: false, // Split mode restore edilmez
        splitPrimaryTabId: null,
        splitSecondaryTabId: null,
        splitOrientation: "horizontal",
        maxTabs: action.payload.maxTabs || DEFAULT_MAX_TABS,
      }
    }

    default:
      return state
  }
}

// Context
const TabContext = React.createContext<TabContextType | null>(null)

// Provider
export function TabProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLocale()
  const [state, dispatch] = React.useReducer(tabReducer, initialState)
  const [mounted, setMounted] = React.useState(false)
  const isInitialMount = React.useRef(true)

  // localStorage'dan hydrate - titleKey kullanarak current locale'e göre title al
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(TAB_STORAGE_KEY)
      if (stored) {
        const parsed: PersistedTabState = JSON.parse(stored)
        if (parsed.version === TAB_STORAGE_VERSION && parsed.tabs.length > 0) {
          dispatch({
            type: "HYDRATE",
            payload: {
              tabs: parsed.tabs.map((tab) => ({
                ...tab,
                lastActiveAt: tab.openedAt,
                // Title'ı her zaman current locale'den al (dinamik değilse)
                title: tab.isDynamic ? tab.title : getRouteTitle(tab.path, t.tabs),
                icon: tab.path === "/" ? "Home" : tab.icon,
              })),
              activeTabId: parsed.activeTabId,
              groups: parsed.groups || [],
              sessions: parsed.sessions || [],
              activeTabHistory: [],
              closedTabHistory: [],
              maxTabs: DEFAULT_MAX_TABS,
            },
          })
        }
      }
    } catch (e) {
      console.error("Tab state restore failed:", e)
    }
    setMounted(true)
  }, [t.tabs])

  // localStorage'a kaydet (debounced)
  React.useEffect(() => {
    if (!mounted) return

    const timeoutId = setTimeout(() => {
      const persistedState: PersistedTabState = {
        version: TAB_STORAGE_VERSION,
        tabs: state.tabs.map((t) => ({
          id: t.id,
          path: t.path,
          title: t.title,
          icon: t.icon,
          scrollPosition: t.scrollPosition,
          openedAt: t.openedAt,
          isDynamic: t.isDynamic,
          isPinned: t.isPinned,
          groupId: t.groupId,
        })),
        activeTabId: state.activeTabId,
        groups: state.groups,
        sessions: state.sessions,
      }
      localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(persistedState))
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [state, mounted])

  // URL'yi aktif tab ile sync et
  React.useEffect(() => {
    if (!mounted || isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId)
    if (activeTab && activeTab.path !== pathname) {
      router.push(activeTab.path, { scroll: false })
    }
  }, [state.activeTabId, mounted])

  // Locale değişince tüm tab title'larını güncelle (dinamik olanlar hariç)
  React.useEffect(() => {
    if (!mounted || state.tabs.length === 0) return

    state.tabs.forEach((tab) => {
      // Dinamik başlıkları koruyoruz (kişi adı gibi)
      if (tab.isDynamic) return

      const newTitle = getRouteTitle(tab.path, t.tabs)
      if (tab.title !== newTitle) {
        dispatch({ type: "UPDATE_TITLE", payload: { tabId: tab.id, title: newTitle } })
      }
    })
  }, [t.tabs, mounted])

  // İlk yüklemede veya URL değişince tab aç
  React.useEffect(() => {
    if (!mounted) return

    // Eğer hiç tab yoksa ve pathname varsa, aç
    if (state.tabs.length === 0 && pathname) {
      const title = getRouteTitle(pathname, t.tabs)
      const icon = getRouteIcon(pathname)
      dispatch({
        type: "OPEN_TAB",
        payload: { path: pathname, title, icon },
      })
      return
    }

    // Pathname değişti ve o path'te tab yoksa (doğrudan URL navigasyonu)
    const existingTab = state.tabs.find((tab) => tab.path === pathname)
    if (!existingTab && pathname && pathname !== "/") {
      const title = getRouteTitle(pathname, t.tabs)
      const icon = getRouteIcon(pathname)
      dispatch({
        type: "OPEN_TAB",
        payload: { path: pathname, title, icon },
      })
    } else if (existingTab && existingTab.id !== state.activeTabId) {
      // Tab var ama aktif değil, aktif yap
      dispatch({ type: "SET_ACTIVE", payload: { tabId: existingTab.id } })
    }
  }, [pathname, mounted, t.tabs])

  // Actions
  const openTab = React.useCallback(
    (path: string, options?: OpenTabOptions) => {
      const title = getRouteTitle(path, t.tabs)
      const icon = getRouteIcon(path)
      dispatch({ type: "OPEN_TAB", payload: { path, title, icon, options } })
    },
    [t.tabs]
  )

  const closeTab = React.useCallback((tabId: string) => {
    dispatch({ type: "CLOSE_TAB", payload: { tabId } })
  }, [])

  const closeOtherTabs = React.useCallback((tabId: string) => {
    dispatch({ type: "CLOSE_OTHER_TABS", payload: { tabId } })
  }, [])

  const closeAllTabs = React.useCallback(() => {
    dispatch({ type: "CLOSE_ALL_TABS" })
  }, [])

  const closeAllExceptHome = React.useCallback(() => {
    dispatch({ type: "CLOSE_ALL_EXCEPT_HOME" })
  }, [])

  const closeTabsToRight = React.useCallback((tabId: string) => {
    dispatch({ type: "CLOSE_TABS_TO_RIGHT", payload: { tabId } })
  }, [])

  const setActiveTab = React.useCallback((tabId: string) => {
    dispatch({ type: "SET_ACTIVE", payload: { tabId } })
  }, [])

  const updateTabTitle = React.useCallback((tabId: string, title: string, isDynamic?: boolean) => {
    dispatch({ type: "UPDATE_TITLE", payload: { tabId, title, isDynamic } })
  }, [])

  const updateTabIcon = React.useCallback((tabId: string, icon: string) => {
    dispatch({ type: "UPDATE_ICON", payload: { tabId, icon } })
  }, [])

  const updateScrollPosition = React.useCallback(
    (tabId: string, position: number) => {
      dispatch({ type: "UPDATE_SCROLL", payload: { tabId, position } })
    },
    []
  )

  const setTabDirty = React.useCallback((tabId: string, isDirty: boolean) => {
    dispatch({ type: "SET_TAB_DIRTY", payload: { tabId, isDirty } })
  }, [])

  const reorderTabs = React.useCallback(
    (fromIndex: number, toIndex: number) => {
      dispatch({ type: "REORDER", payload: { fromIndex, toIndex } })
    },
    []
  )

  const reopenLastClosedTab = React.useCallback(() => {
    dispatch({ type: "REOPEN_LAST_CLOSED_TAB" })
  }, [])

  const pinTab = React.useCallback((tabId: string) => {
    dispatch({ type: "PIN_TAB", payload: { tabId } })
  }, [])

  const unpinTab = React.useCallback((tabId: string) => {
    dispatch({ type: "UNPIN_TAB", payload: { tabId } })
  }, [])

  const createGroup = React.useCallback((name: string, color: string): string => {
    const groupId = uuidv4()
    dispatch({ type: "CREATE_GROUP", payload: { groupId, name, color } })
    return groupId
  }, [])

  const updateGroup = React.useCallback((groupId: string, name?: string, color?: string) => {
    dispatch({ type: "UPDATE_GROUP", payload: { groupId, name, color } })
  }, [])

  const deleteGroup = React.useCallback((groupId: string) => {
    dispatch({ type: "DELETE_GROUP", payload: { groupId } })
  }, [])

  const assignTabToGroup = React.useCallback((tabId: string, groupId: string | null) => {
    dispatch({ type: "ASSIGN_TAB_TO_GROUP", payload: { tabId, groupId } })
  }, [])

  const saveSession = React.useCallback((name: string): string => {
    const sessionId = uuidv4()
    dispatch({ type: "SAVE_SESSION", payload: { sessionId, name } })
    return sessionId
  }, [])

  const loadSession = React.useCallback((sessionId: string) => {
    dispatch({ type: "LOAD_SESSION", payload: { sessionId } })
  }, [])

  const deleteSession = React.useCallback((sessionId: string) => {
    dispatch({ type: "DELETE_SESSION", payload: { sessionId } })
  }, [])

  const startSplitView = React.useCallback((tabId: string, orientation: SplitOrientation) => {
    dispatch({ type: "START_SPLIT_VIEW", payload: { tabId, orientation } })
  }, [])

  const selectSplitTab = React.useCallback((tabId: string) => {
    dispatch({ type: "SELECT_SPLIT_TAB", payload: { tabId } })
  }, [])

  const closeSplitView = React.useCallback(() => {
    dispatch({ type: "CLOSE_SPLIT_VIEW" })
  }, [])

  const getTabByPath = React.useCallback(
    (path: string) => {
      return state.tabs.find((t) => t.path === path)
    },
    [state.tabs]
  )

  const activeTab = state.tabs.find((t) => t.id === state.activeTabId) || null

  const value: TabContextType = {
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    activeTab,
    mounted,
    closedTabHistory: state.closedTabHistory,
    groups: state.groups,
    sessions: state.sessions,
    splitActive: state.splitActive,
    splitPrimaryTabId: state.splitPrimaryTabId,
    splitSecondaryTabId: state.splitSecondaryTabId,
    splitOrientation: state.splitOrientation,
    openTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    closeAllExceptHome,
    closeTabsToRight,
    setActiveTab,
    updateTabTitle,
    updateTabIcon,
    updateScrollPosition,
    setTabDirty,
    reorderTabs,
    reopenLastClosedTab,
    pinTab,
    unpinTab,
    createGroup,
    updateGroup,
    deleteGroup,
    assignTabToGroup,
    saveSession,
    loadSession,
    deleteSession,
    startSplitView,
    selectSplitTab,
    closeSplitView,
    getTabByPath,
  }

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>
}

// Hook
export function useTabs() {
  const context = React.useContext(TabContext)
  if (!context) {
    throw new Error("useTabs must be used within TabProvider")
  }
  return context
}
