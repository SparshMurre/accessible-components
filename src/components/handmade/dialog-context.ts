import * as React from "react"

export interface HandmadeDialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  dialogId: string
  titleId: string
  descriptionId: string
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  initialFocusRef?: React.RefObject<HTMLElement | null>
}

export const HandmadeDialogContext =
  React.createContext<HandmadeDialogContextValue | null>(null)

export function useHandmadeDialog(): HandmadeDialogContextValue {
  const context = React.useContext(HandmadeDialogContext)
  if (!context) {
    throw new Error("useHandmadeDialog must be used within a HandmadeDialog")
  }
  return context
}
