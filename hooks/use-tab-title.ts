"use client"

import * as React from "react"
import { useTabs } from "@/components/providers/tab-provider"
import { useCurrentTabId } from "@/components/tabs/tab-panel"

/**
 * Hook for updating tab title dynamically.
 * Uses the current tab's ID from TabIdContext to ensure
 * the correct tab's title is updated when switching between tabs.
 */
export function useTabTitle(title: string | undefined) {
  const { updateTabTitle } = useTabs()
  const currentTabId = useCurrentTabId()

  React.useEffect(() => {
    if (title && currentTabId) {
      updateTabTitle(currentTabId, title)
    }
  }, [title, currentTabId, updateTabTitle])
}
