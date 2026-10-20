import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import {
  HandmadeDialogContext,
  useHandmadeDialog,
  type HandmadeDialogContextValue,
} from "./dialog-context"

const emptySubscribe = () => () => {}

function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export interface HandmadeDialogProps {
  children: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  initialFocusRef?: React.RefObject<HTMLElement | null>
  restoreFocus?: boolean
}

export function HandmadeDialog({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  initialFocusRef,
}: HandmadeDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState<boolean>(defaultOpen)
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
  const dialogId = `handmade-dialog-${id}`
  const titleId = `handmade-dialog-title-${id}`
  const descriptionId = `handmade-dialog-desc-${id}`

  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  const value = React.useMemo<HandmadeDialogContextValue>(
    () => ({
      open,
      setOpen,
      dialogId,
      titleId,
      descriptionId,
      triggerRef,
      contentRef,
      initialFocusRef,
    }),
    [open, setOpen, dialogId, titleId, descriptionId, initialFocusRef]
  )

  return (
    <HandmadeDialogContext.Provider value={value}>
      {children}
    </HandmadeDialogContext.Provider>
  )
}

export interface HandmadeDialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function HandmadeDialogTrigger({
  children,
  className,
  onClick,
  ...props
}: HandmadeDialogTriggerProps) {
  const { open, setOpen, dialogId, triggerRef } = useHandmadeDialog()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (!e.defaultPrevented) {
      setOpen(!open)
    }
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={dialogId}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export interface HandmadeDialogPortalProps {
  children: React.ReactNode
}

export function HandmadeDialogPortal({ children }: HandmadeDialogPortalProps) {
  const { open } = useHandmadeDialog()
  const mounted = useIsMounted()

  if (!open || !mounted) {
    return null
  }

  return createPortal(children, document.body)
}

export interface HandmadeDialogOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  closeOnOverlayClick?: boolean
}

export function HandmadeDialogOverlay({
  className,
  closeOnOverlayClick = true,
  onClick,
  ...props
}: HandmadeDialogOverlayProps) {
  const { setOpen } = useHandmadeDialog()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    if (closeOnOverlayClick && !e.defaultPrevented) {
      setOpen(false)
    }
  }

  return (
    <div
      aria-hidden="true"
      onClick={handleClick}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-150",
        className
      )}
      {...props}
    />
  )
}

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable]'

export interface HandmadeDialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  role?: "dialog" | "alertdialog"
  closeOnEscape?: boolean
}

export function HandmadeDialogContent({
  children,
  className,
  role = "dialog",
  closeOnEscape = true,
  ...props
}: HandmadeDialogContentProps) {
  const {
    open,
    setOpen,
    dialogId,
    titleId,
    descriptionId,
    contentRef,
    triggerRef,
    initialFocusRef,
  } = useHandmadeDialog()

  // Track previously focused element to restore focus when dialog closes
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null)

  // Focus trapping and initial focus
  React.useEffect(() => {
    if (!open) return

    // Save current active element
    previousActiveElementRef.current = document.activeElement as HTMLElement | null

    // Lock body scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const triggerEl = triggerRef.current
    const container = contentRef.current

    if (container) {
      const focusTarget = () => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus()
          return
        }

        const focusables = Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter(
          (el) =>
            el.tabIndex !== -1 &&
            !el.hasAttribute("disabled") &&
            el.offsetParent !== null
        )

        if (focusables.length > 0) {
          focusables[0].focus()
        } else {
          container.focus()
        }
      }

      const rafId = requestAnimationFrame(focusTarget)

      return () => {
        cancelAnimationFrame(rafId)
        document.body.style.overflow = originalOverflow

        // Restore focus on close
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === "function") {
          previousActiveElementRef.current.focus()
        } else if (triggerEl) {
          triggerEl.focus()
        }
      }
    }

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open, contentRef, initialFocusRef, triggerRef])

  // Keydown listener for Escape and Tab trap
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (closeOnEscape && e.key === "Escape") {
      e.stopPropagation()
      e.preventDefault()
      setOpen(false)
      return
    }

    if (e.key === "Tab") {
      const container = contentRef.current
      if (!container) return

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(
        (el) =>
          el.tabIndex !== -1 &&
          !el.hasAttribute("disabled") &&
          el.offsetParent !== null
      )

      if (focusables.length === 0) {
        e.preventDefault()
        return
      }

      const firstElement = focusables[0]
      const lastElement = focusables[focusables.length - 1]

      if (e.shiftKey) {
        // Shift + Tab: wrap from first to last
        if (document.activeElement === firstElement || document.activeElement === container) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
  }

  return (
    <div
      ref={contentRef}
      id={dialogId}
      role={role}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={cn(
        "fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4",
        "rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900",
        "focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function HandmadeDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-left", className)}
      {...props}
    />
  )
}

export function HandmadeDialogTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useHandmadeDialog()
  return (
    <h2
      id={titleId}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-neutral-900 dark:text-neutral-100",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
}

export function HandmadeDialogDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useHandmadeDialog()
  return (
    <p
      id={descriptionId}
      className={cn("text-sm text-neutral-500 dark:text-neutral-400", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function HandmadeDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  )
}

export type HandmadeDialogCloseProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export function HandmadeDialogClose({
  children,
  className,
  onClick,
  ...props
}: HandmadeDialogCloseProps) {
  const { setOpen } = useHandmadeDialog()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    if (!e.defaultPrevented) {
      setOpen(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
