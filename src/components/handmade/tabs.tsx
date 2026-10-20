import * as React from "react"
import { cn } from "@/lib/utils"
import {
  HandmadeTabsContext,
  useHandmadeTabs,
  type HandmadeTabsContextValue,
  type TabsActivationMode,
  type TabsOrientation,
} from "./tabs-context"

export interface HandmadeTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: TabsOrientation
  activationMode?: TabsActivationMode
}

export function HandmadeTabs({
  children,
  className,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  orientation = "horizontal",
  activationMode = "automatic",
  ...props
}: HandmadeTabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  const handleValueChange = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue)
      }
      onValueChange?.(nextValue)
    },
    [isControlled, onValueChange]
  )

  const id = React.useId()
  const baseId = `handmade-tabs-${id}`
  const tabsListRef = React.useRef<HTMLDivElement | null>(null)

  // Registry for registered tabs to handle roving tabindex and keyboard navigation
  const tabsMapRef = React.useRef<Map<string, { element: HTMLButtonElement; disabled: boolean }>>(
    new Map()
  )

  const registerTab = React.useCallback(
    (tabValue: string, element: HTMLButtonElement, disabled: boolean) => {
      tabsMapRef.current.set(tabValue, { element, disabled })
    },
    []
  )

  const unregisterTab = React.useCallback((tabValue: string) => {
    tabsMapRef.current.delete(tabValue)
  }, [])

  const contextValue = React.useMemo<HandmadeTabsContextValue>(
    () => ({
      value,
      onValueChange: handleValueChange,
      orientation,
      activationMode,
      baseId,
      tabsListRef,
      registerTab,
      unregisterTab,
    }),
    [value, handleValueChange, orientation, activationMode, baseId, registerTab, unregisterTab]
  )

  return (
    <HandmadeTabsContext.Provider value={contextValue}>
      <div
        data-orientation={orientation}
        className={cn(
          "flex flex-col gap-3",
          orientation === "vertical" && "flex-row",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </HandmadeTabsContext.Provider>
  )
}

export interface HandmadeTabsListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  "aria-label"?: string
  "aria-labelledby"?: string
}

export function HandmadeTabsList({
  children,
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: HandmadeTabsListProps) {
  const { orientation, activationMode, onValueChange, tabsListRef } = useHandmadeTabs()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const list = tabsListRef.current
    if (!list) return

    // Query all tab buttons
    const tabButtons = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    ).filter((btn) => !btn.disabled && !btn.getAttribute("aria-disabled"))

    if (tabButtons.length === 0) return

    const currentIndex = tabButtons.findIndex((btn) => btn === document.activeElement)
    if (currentIndex === -1) return

    let nextIndex: number | null = null

    if (orientation === "horizontal") {
      if (e.key === "ArrowRight") {
        nextIndex = (currentIndex + 1) % tabButtons.length
      } else if (e.key === "ArrowLeft") {
        nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length
      }
    } else {
      if (e.key === "ArrowDown") {
        nextIndex = (currentIndex + 1) % tabButtons.length
      } else if (e.key === "ArrowUp") {
        nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length
      }
    }

    if (e.key === "Home") {
      nextIndex = 0
    } else if (e.key === "End") {
      nextIndex = tabButtons.length - 1
    }

    if (nextIndex !== null) {
      e.preventDefault()
      const nextTab = tabButtons[nextIndex]
      nextTab.focus()

      // Automatic activation: focus selects tab immediately
      if (activationMode === "automatic") {
        const nextValue = nextTab.getAttribute("data-tab-value")
        if (nextValue) {
          onValueChange(nextValue)
        }
      }
    }
  }

  return (
    <div
      ref={tabsListRef}
      role="tablist"
      aria-orientation={orientation}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center rounded-lg bg-neutral-100 p-1 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
        orientation === "vertical" && "flex-col items-stretch",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface HandmadeTabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  disabled?: boolean
}

export function HandmadeTabsTrigger({
  value: tabValue,
  disabled = false,
  children,
  className,
  onClick,
  onKeyDown,
  ...props
}: HandmadeTabsTriggerProps) {
  const { value, onValueChange, baseId, registerTab, unregisterTab, activationMode } =
    useHandmadeTabs()
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)

  const isSelected = value === tabValue
  const tabId = `${baseId}-tab-${tabValue}`
  const panelId = `${baseId}-panel-${tabValue}`

  React.useEffect(() => {
    if (buttonRef.current) {
      registerTab(tabValue, buttonRef.current, disabled)
    }
    return () => {
      unregisterTab(tabValue)
    }
  }, [tabValue, disabled, registerTab, unregisterTab])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (!disabled && !e.defaultPrevented) {
      onValueChange(tabValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e)
    // In manual activation mode, Enter or Space activates the focused tab
    if (activationMode === "manual" && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      if (!disabled) {
        onValueChange(tabValue)
      }
    }
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isSelected}
      aria-controls={panelId}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      tabIndex={isSelected ? 0 : -1} // Roving tabindex
      data-tab-value={tabValue}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100"
          : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export interface HandmadeTabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  forceMount?: boolean
}

export function HandmadeTabsContent({
  value: tabValue,
  forceMount = false,
  children,
  className,
  ...props
}: HandmadeTabsContentProps) {
  const { value, baseId } = useHandmadeTabs()
  const isSelected = value === tabValue

  const tabId = `${baseId}-tab-${tabValue}`
  const panelId = `${baseId}-panel-${tabValue}`

  if (!isSelected && !forceMount) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0} // Allows keyboard focus into the tabpanel per WAI-ARIA
      hidden={!isSelected}
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
