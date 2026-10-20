import * as React from "react"

export type TabsOrientation = "horizontal" | "vertical"
export type TabsActivationMode = "automatic" | "manual"

export interface HandmadeTabsContextValue {
  value: string
  onValueChange: (value: string) => void
  orientation: TabsOrientation
  activationMode: TabsActivationMode
  baseId: string
  tabsListRef: React.RefObject<HTMLDivElement | null>
  registerTab: (tabValue: string, element: HTMLButtonElement, disabled: boolean) => void
  unregisterTab: (tabValue: string) => void
}

export const HandmadeTabsContext =
  React.createContext<HandmadeTabsContextValue | null>(null)

export function useHandmadeTabs(): HandmadeTabsContextValue {
  const context = React.useContext(HandmadeTabsContext)
  if (!context) {
    throw new Error("useHandmadeTabs must be used within a HandmadeTabs")
  }
  return context
}
