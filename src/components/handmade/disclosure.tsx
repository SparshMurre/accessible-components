import * as React from "react"
import { cn } from "@/lib/utils"
import {
  HandmadeAccordionContext,
  HandmadeDisclosureContext,
  useHandmadeAccordion,
  useHandmadeDisclosure,
  type HandmadeAccordionContextValue,
  type HandmadeDisclosureContextValue,
} from "./disclosure-context"

/* =========================================================================
   Handmade Disclosure (Single Collapsible)
   ========================================================================= */

export interface HandmadeDisclosureProps
  extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function HandmadeDisclosure({
  children,
  className,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}: HandmadeDisclosureProps) {
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState<boolean>(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  const id = React.useId()
  const disclosureId = `handmade-disclosure-${id}`
  const triggerId = `${disclosureId}-trigger`
  const contentId = `${disclosureId}-content`

  const value = React.useMemo<HandmadeDisclosureContextValue>(
    () => ({
      open,
      setOpen,
      disclosureId,
      triggerId,
      contentId,
    }),
    [open, setOpen, disclosureId, triggerId, contentId]
  )

  return (
    <HandmadeDisclosureContext.Provider value={value}>
      <div
        id={disclosureId}
        className={cn("rounded-lg border border-neutral-200 dark:border-neutral-800", className)}
        {...props}
      >
        {children}
      </div>
    </HandmadeDisclosureContext.Provider>
  )
}

export type HandmadeDisclosureTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function HandmadeDisclosureTrigger({
  children,
  className,
  onClick,
  ...props
}: HandmadeDisclosureTriggerProps) {
  const { open, setOpen, triggerId, contentId } = useHandmadeDisclosure()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (!e.defaultPrevented) {
      setOpen(!open)
    }
  }

  return (
    <button
      type="button"
      id={triggerId}
      aria-expanded={open}
      aria-controls={contentId}
      onClick={handleClick}
      className={cn(
        "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
        className
      )}
      {...props}
    >
      {children}
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200",
          open && "rotate-180"
        )}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  )
}

export interface HandmadeDisclosureContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  forceMount?: boolean
}

export function HandmadeDisclosureContent({
  children,
  className,
  forceMount = false,
  ...props
}: HandmadeDisclosureContentProps) {
  const { open, contentId, triggerId } = useHandmadeDisclosure()

  if (!open && !forceMount) {
    return null
  }

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!open}
      className={cn(
        "border-t border-neutral-200 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/* =========================================================================
   Handmade Accordion (Multiple Disclosures)
   ========================================================================= */

export interface HandmadeAccordionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

export function HandmadeAccordion({
  children,
  className,
  type = "single",
  defaultValue,
  value: controlledValue,
  onValueChange,
  ...props
}: HandmadeAccordionProps) {
  const initialValue = React.useMemo(() => {
    if (defaultValue === undefined) return []
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  }, [defaultValue])

  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<string[]>(initialValue)

  const isControlled = controlledValue !== undefined
  const value = React.useMemo(() => {
    if (!isControlled) return uncontrolledValue
    return Array.isArray(controlledValue) ? controlledValue : [controlledValue]
  }, [isControlled, controlledValue, uncontrolledValue])

  const accordionRef = React.useRef<HTMLDivElement | null>(null)

  const toggleItem = React.useCallback(
    (itemValue: string) => {
      let nextValue: string[]
      if (type === "single") {
        nextValue = value.includes(itemValue) ? [] : [itemValue]
      } else {
        nextValue = value.includes(itemValue)
          ? value.filter((v) => v !== itemValue)
          : [...value, itemValue]
      }

      if (!isControlled) {
        setUncontrolledValue(nextValue)
      }
      onValueChange?.(type === "single" ? nextValue[0] ?? "" : nextValue)
    },
    [type, value, isControlled, onValueChange]
  )

  const contextVal = React.useMemo<HandmadeAccordionContextValue>(
    () => ({
      type,
      value,
      toggleItem,
      accordionRef,
    }),
    [type, value, toggleItem]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const root = accordionRef.current
    if (!root) return

    const triggers = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[data-accordion-trigger="true"]')
    ).filter((btn) => !btn.disabled)

    if (triggers.length === 0) return

    const currentIndex = triggers.findIndex((btn) => btn === document.activeElement)
    if (currentIndex === -1) return

    let nextIndex: number | null = null

    if (e.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % triggers.length
    } else if (e.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + triggers.length) % triggers.length
    } else if (e.key === "Home") {
      nextIndex = 0
    } else if (e.key === "End") {
      nextIndex = triggers.length - 1
    }

    if (nextIndex !== null) {
      e.preventDefault()
      triggers[nextIndex].focus()
    }
  }

  return (
    <HandmadeAccordionContext.Provider value={contextVal}>
      <div
        ref={accordionRef}
        onKeyDown={handleKeyDown}
        className={cn("divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800", className)}
        {...props}
      >
        {children}
      </div>
    </HandmadeAccordionContext.Provider>
  )
}

export interface HandmadeAccordionItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function HandmadeAccordionItem({
  value: itemValue,
  children,
  className,
  ...props
}: HandmadeAccordionItemProps) {
  const { value, toggleItem } = useHandmadeAccordion()
  const isOpen = value.includes(itemValue)
  const id = React.useId()
  const triggerId = `accordion-trigger-${id}`
  const contentId = `accordion-content-${id}`

  return (
    <div className={cn("overflow-hidden", className)} {...props}>
      <HandmadeDisclosureContext.Provider
        value={{
          open: isOpen,
          setOpen: () => toggleItem(itemValue),
          disclosureId: `accordion-item-${id}`,
          triggerId,
          contentId,
        }}
      >
        {children}
      </HandmadeDisclosureContext.Provider>
    </div>
  )
}

export function HandmadeAccordionTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, triggerId, contentId } = useHandmadeDisclosure()

  return (
    <h3 className="m-0 flex">
      <button
        type="button"
        id={triggerId}
        data-accordion-trigger="true"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex flex-1 items-center justify-between px-4 py-3 text-left text-sm font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
          "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
          className
        )}
        {...props}
      >
        {children}
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </h3>
  )
}

export function HandmadeAccordionContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open, contentId, triggerId } = useHandmadeDisclosure()

  if (!open) return null

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={cn(
        "px-4 pb-4 pt-1 text-sm text-neutral-600 dark:text-neutral-400",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
