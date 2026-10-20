import * as React from "react"

export interface HandmadeDisclosureContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  disclosureId: string
  triggerId: string
  contentId: string
}

export const HandmadeDisclosureContext =
  React.createContext<HandmadeDisclosureContextValue | null>(null)

export function useHandmadeDisclosure(): HandmadeDisclosureContextValue {
  const context = React.useContext(HandmadeDisclosureContext)
  if (!context) {
    throw new Error(
      "useHandmadeDisclosure must be used within a HandmadeDisclosure"
    )
  }
  return context
}

export interface HandmadeAccordionContextValue {
  type: "single" | "multiple"
  value: string[]
  toggleItem: (itemValue: string) => void
  accordionRef: React.RefObject<HTMLDivElement | null>
}

export const HandmadeAccordionContext =
  React.createContext<HandmadeAccordionContextValue | null>(null)

export function useHandmadeAccordion(): HandmadeAccordionContextValue {
  const context = React.useContext(HandmadeAccordionContext)
  if (!context) {
    throw new Error(
      "useHandmadeAccordion must be used within a HandmadeAccordion"
    )
  }
  return context
}
