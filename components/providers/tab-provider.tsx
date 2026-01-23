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
} from "@/types/tabs"
import { getRouteTitle, getRouteIcon } from "@/lib/tab-config"

const TAB_STORAGE_KEY = "altay_tabs_state"
const TAB_STORAGE_VERSION = 1
const DEFAULT_MAX_TABS = 15

// Initial state
const initialState: TabState = {
  tabs: [],
  activeTabId: null,
  maxTabs: DEFAULT_MAX_TABS,
}

// Reducer
function tabReducer(state: TabState, action: TabAction): TabState {
  switch (action.type) {
    case "OPEN_TAB": {
      const { path, title, icon, options } = action.payload
      const existingTab = state.tabs.find((t) => t.path === path)

      // Zaten açık - focus ol
      if (existingTab) {
        if (options?.background) {
          return state // Background'da açılıyorsa active değiştirme
        }
        return {
          ...state,
          activeTabId: existingTab.id,
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
      }

      let newTabs = [...state.tabs, newTab]

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

      return {
        ...state,
        tabs: newTabs,
        activeTabId: options?.background ? state.activeTabId : newTab.id,
      }
    }

    case "CLOSE_TAB": {
      const { tabId } = action.payload
      const tab = state.tabs.find((t) => t.id === tabId)

      // Ana sayfa tabı kapatılamaz
      if (!tab || tab.path === "/") return state

      const tabIndex = state.tabs.findIndex((t) => t.id === tabId)
      const newTabs = state.tabs.filter((t) => t.id !== tabId)

      // Aktif tab kapatılıyorsa yeni aktif seç
      let newActiveId = state.activeTabId
      if (state.activeTabId === tabId) {
        if (newTabs.length === 0) {
          newActiveId = null
        } else if (tabIndex >= newTabs.length) {
          // Son tab kapatıldı, bir öncekine git
          newActiveId = newTabs[newTabs.length - 1].id
        } else {
          // Aynı pozisyondaki tab'a git
          newActiveId = newTabs[tabIndex].id
        }
      }

      return {
        ...state,
        tabs: newTabs,
        activeTabId: newActiveId,
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

      return {
        ...state,
        tabs: tabsToKeep,
        activeTabId: tabId,
      }
    }

    case "CLOSE_TABS_TO_RIGHT": {
      const { tabId } = action.payload
      const tabIndex = state.tabs.findIndex((t) => t.id === tabId)
      if (tabIndex === -1) return state

      // Ana sayfa her zaman kalır
      const newTabs = state.tabs.filter((t, i) => i <= tabIndex || t.path === "/")
      const activeStillExists = newTabs.some((t) => t.id === state.activeTabId)

      return {
        ...state,
        tabs: newTabs,
        activeTabId: activeStillExists ? state.activeTabId : tabId,
      }
    }

    case "CLOSE_ALL_TABS": {
      return {
        ...state,
        tabs: [],
        activeTabId: null,
      }
    }

    case "SET_ACTIVE": {
      const { tabId } = action.payload
      const tab = state.tabs.find((t) => t.id === tabId)
      if (!tab) return state

      return {
        ...state,
        activeTabId: tabId,
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, lastActiveAt: Date.now() } : t
        ),
      }
    }

    case "UPDATE_TITLE": {
      const { tabId, title } = action.payload
      // Ana sayfa başlığı değiştirilemez
      const tab = state.tabs.find((t) => t.id === tabId)
      if (tab?.path === "/") return state

      return {
        ...state,
        tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, title } : t)),
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

    case "REORDER": {
      const { fromIndex, toIndex } = action.payload
      const newTabs = [...state.tabs]
      const [movedTab] = newTabs.splice(fromIndex, 1)
      newTabs.splice(toIndex, 0, movedTab)
      return { ...state, tabs: newTabs }
    }

    case "HYDRATE": {
      return {
        ...action.payload,
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
  const [state, dispatch] = React.useReducer(tabReducer, initialState)
  const [mounted, setMounted] = React.useState(false)
  const isInitialMount = React.useRef(true)

  // localStorage'dan hydrate
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(TAB_STORAGE_KEY)
      if (stored) {
        const parsed: PersistedTabState = JSON.parse(stored)
        if (parsed.version === TAB_STORAGE_VERSION && parsed.tabs.length > 0) {
          dispatch({
            type: "HYDRATE",
            payload: {
              tabs: parsed.tabs.map((t) => ({
                ...t,
                lastActiveAt: t.openedAt,
                // Ana sayfa başlığını her zaman doğru tut
                title: t.path === "/" ? "Ana Sayfa" : t.title,
                icon: t.path === "/" ? "Home" : t.icon,
              })),
              activeTabId: parsed.activeTabId,
              maxTabs: DEFAULT_MAX_TABS,
            },
          })
        }
      }
    } catch (e) {
      console.error("Tab state restore failed:", e)
    }
    setMounted(true)
  }, [])

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
        })),
        activeTabId: state.activeTabId,
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

    const activeTab = state.tabs.find((t) => t.id === state.activeTabId)
    if (activeTab && activeTab.path !== pathname) {
      router.push(activeTab.path, { scroll: false })
    }
  }, [state.activeTabId, mounted])

  // İlk yüklemede veya URL değişince tab aç
  React.useEffect(() => {
    if (!mounted) return

    // Eğer hiç tab yoksa ve pathname varsa, aç
    if (state.tabs.length === 0 && pathname) {
      const title = getRouteTitle(pathname)
      const icon = getRouteIcon(pathname)
      dispatch({
        type: "OPEN_TAB",
        payload: { path: pathname, title, icon },
      })
      return
    }

    // Pathname değişti ve o path'te tab yoksa (doğrudan URL navigasyonu)
    const existingTab = state.tabs.find((t) => t.path === pathname)
    if (!existingTab && pathname && pathname !== "/") {
      const title = getRouteTitle(pathname)
      const icon = getRouteIcon(pathname)
      dispatch({
        type: "OPEN_TAB",
        payload: { path: pathname, title, icon },
      })
    } else if (existingTab && existingTab.id !== state.activeTabId) {
      // Tab var ama aktif değil, aktif yap
      dispatch({ type: "SET_ACTIVE", payload: { tabId: existingTab.id } })
    }
  }, [pathname, mounted])

  // Actions
  const openTab = React.useCallback(
    (path: string, options?: OpenTabOptions) => {
      const title = getRouteTitle(path)
      const icon = getRouteIcon(path)
      dispatch({ type: "OPEN_TAB", payload: { path, title, icon, options } })
    },
    []
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

  const closeTabsToRight = React.useCallback((tabId: string) => {
    dispatch({ type: "CLOSE_TABS_TO_RIGHT", payload: { tabId } })
  }, [])

  const setActiveTab = React.useCallback((tabId: string) => {
    dispatch({ type: "SET_ACTIVE", payload: { tabId } })
  }, [])

  const updateTabTitle = React.useCallback((tabId: string, title: string) => {
    dispatch({ type: "UPDATE_TITLE", payload: { tabId, title } })
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

  const reorderTabs = React.useCallback(
    (fromIndex: number, toIndex: number) => {
      dispatch({ type: "REORDER", payload: { fromIndex, toIndex } })
    },
    []
  )

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
    openTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    closeTabsToRight,
    setActiveTab,
    updateTabTitle,
    updateTabIcon,
    updateScrollPosition,
    reorderTabs,
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
