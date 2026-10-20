import * as React from "react"
import {
  HandmadeDialog,
  HandmadeDialogClose,
  HandmadeDialogContent,
  HandmadeDialogDescription,
  HandmadeDialogFooter,
  HandmadeDialogHeader,
  HandmadeDialogOverlay,
  HandmadeDialogPortal,
  HandmadeDialogTitle,
  HandmadeDialogTrigger,
  HandmadeTabs,
  HandmadeTabsContent,
  HandmadeTabsList,
  HandmadeTabsTrigger,
  HandmadeDisclosure,
  HandmadeDisclosureContent,
  HandmadeDisclosureTrigger,
  HandmadeAccordion,
  HandmadeAccordionContent,
  HandmadeAccordionItem,
  HandmadeAccordionTrigger,
} from "@/components/handmade"
import {
  Dialog as ShadcnDialog,
  DialogClose as ShadcnDialogClose,
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs as ShadcnTabs,
  TabsContent as ShadcnTabsContent,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { KeyboardChecklist } from "@/components/checklist/KeyboardChecklist"

export default function App() {
  const [formData, setFormData] = React.useState({ name: "", email: "" })
  const initialInputRef = React.useRef<HTMLInputElement | null>(null)

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-50">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header */}
        <header className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2">
              <span className="rounded-md bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                FE-05
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Accessible UI Components & Keyboard Navigation
              </h1>
            </div>
            <p className="text-base text-neutral-600 dark:text-neutral-400">
              Comparative demonstration of handmade accessible components (Dialog, Tabs, Disclosure)
              vs production shadcn/ui primitives, adhering to WAI-ARIA authoring practices.
            </p>
          </div>
        </header>

        {/* Section 1: Dialog Comparison */}
        <section aria-labelledby="dialog-section-heading" className="space-y-4">
          <div>
            <h2 id="dialog-section-heading" className="text-2xl font-bold tracking-tight">
              1. Modal Dialog Comparison
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Features focus trapping, initial focus placement, Escape key closing, and focus restoration to the trigger.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Handmade Dialog */}
            <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Handmade Accessible Dialog
                  </h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Handmade
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Custom focus-trap implementation cycling Tab/Shift+Tab, locking body scroll, listening for Escape, and returning focus upon dismissal.
                </p>
              </div>

              <div className="mt-6">
                <HandmadeDialog initialFocusRef={initialInputRef}>
                  <HandmadeDialogTrigger className="bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                    Open Handmade Dialog
                  </HandmadeDialogTrigger>

                  <HandmadeDialogPortal>
                    <HandmadeDialogOverlay />
                    <HandmadeDialogContent>
                      <HandmadeDialogHeader>
                        <HandmadeDialogTitle>
                          Edit Profile Details
                        </HandmadeDialogTitle>
                        <HandmadeDialogDescription>
                          Make updates to your account details below. Focus is trapped inside this modal.
                        </HandmadeDialogDescription>
                      </HandmadeDialogHeader>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          alert(`Saved: ${formData.name} (${formData.email})`)
                        }}
                        className="space-y-4 py-2"
                      >
                        <div className="space-y-1">
                          <label
                            htmlFor="handmade-name"
                            className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400"
                          >
                            Full Name
                          </label>
                          <input
                            ref={initialInputRef}
                            id="handmade-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="e.g. Alice Chen"
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                          />
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor="handmade-email"
                            className="text-xs font-semibold uppercase text-neutral-600 dark:text-neutral-400"
                          >
                            Email Address
                          </label>
                          <input
                            id="handmade-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="alice@example.com"
                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                          />
                        </div>

                        <HandmadeDialogFooter>
                          <HandmadeDialogClose className="border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                            Cancel
                          </HandmadeDialogClose>
                          <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                          >
                            Save Changes
                          </button>
                        </HandmadeDialogFooter>
                      </form>
                    </HandmadeDialogContent>
                  </HandmadeDialogPortal>
                </HandmadeDialog>
              </div>
            </div>

            {/* shadcn/ui Dialog */}
            <div className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    shadcn/ui (Radix Primitive) Dialog
                  </h3>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    shadcn/ui
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Backed by Radix UI's DismissableLayer and FocusScope with nested modal layering and sentinel boundary trapping.
                </p>
              </div>

              <div className="mt-6">
                <ShadcnDialog>
                  <ShadcnDialogTrigger asChild>
                    <Button variant="default">
                      Open shadcn/ui Dialog
                    </Button>
                  </ShadcnDialogTrigger>
                  <ShadcnDialogContent>
                    <ShadcnDialogHeader>
                      <ShadcnDialogTitle>
                        Workspace Settings
                      </ShadcnDialogTitle>
                      <ShadcnDialogDescription>
                        Manage your team preferences and integrations.
                      </ShadcnDialogDescription>
                    </ShadcnDialogHeader>
                    <div className="space-y-3 py-2">
                      <p className="text-xs text-neutral-500">
                        Notice the built-in close icon button (with screen reader label) and subtle zoom/fade entry transitions.
                      </p>
                      <input
                        type="text"
                        placeholder="Project name"
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-neutral-700 dark:bg-neutral-800"
                      />
                    </div>
                    <ShadcnDialogFooter>
                      <ShadcnDialogClose asChild>
                        <Button variant="outline">Dismiss</Button>
                      </ShadcnDialogClose>
                      <Button variant="default">Confirm</Button>
                    </ShadcnDialogFooter>
                  </ShadcnDialogContent>
                </ShadcnDialog>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Tabs Comparison */}
        <section aria-labelledby="tabs-section-heading" className="space-y-4">
          <div>
            <h2 id="tabs-section-heading" className="text-2xl font-bold tracking-tight">
              2. Tabs Component Comparison
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Implements roving tabindex, arrow key navigation (left/right & up/down), and Home/End jump keys.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Handmade Tabs */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Handmade Accessible Tabs
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Handmade
                </span>
              </div>

              <HandmadeTabs defaultValue="overview">
                <HandmadeTabsList aria-label="Handmade component tabs">
                  <HandmadeTabsTrigger value="overview">
                    Overview
                  </HandmadeTabsTrigger>
                  <HandmadeTabsTrigger value="specs">
                    ARIA Specs
                  </HandmadeTabsTrigger>
                  <HandmadeTabsTrigger value="keys">
                    Shortcuts
                  </HandmadeTabsTrigger>
                </HandmadeTabsList>

                <HandmadeTabsContent value="overview">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Handmade Overview
                  </h4>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Tabbing lands only on the active tab button. Use Left/Right arrow keys to switch tabs with roving tabindex.
                  </p>
                </HandmadeTabsContent>

                <HandmadeTabsContent value="specs">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    WAI-ARIA Attributes
                  </h4>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Uses <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">role="tablist"</code>, <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">role="tab"</code>, <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">role="tabpanel"</code>, and synchronized ID references.
                  </p>
                </HandmadeTabsContent>

                <HandmadeTabsContent value="keys">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Key Bindings
                  </h4>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Arrow keys cycle circularly. <kbd className="font-mono text-xs border rounded px-1">Home</kbd> jumps to the first tab, and <kbd className="font-mono text-xs border rounded px-1">End</kbd> jumps to the last.
                  </p>
                </HandmadeTabsContent>
              </HandmadeTabs>
            </div>

            {/* shadcn/ui Tabs */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  shadcn/ui (Radix Primitive) Tabs
                </h3>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  shadcn/ui
                </span>
              </div>

              <ShadcnTabs defaultValue="account">
                <ShadcnTabsList>
                  <ShadcnTabsTrigger value="account">Account</ShadcnTabsTrigger>
                  <ShadcnTabsTrigger value="password">Password</ShadcnTabsTrigger>
                  <ShadcnTabsTrigger value="preferences">Preferences</ShadcnTabsTrigger>
                </ShadcnTabsList>

                <ShadcnTabsContent value="account">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Account Profile
                  </h4>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Powered by Radix UI's RovingFocusGroup, handling automatic RTL mirroring and tab orientation.
                  </p>
                </ShadcnTabsContent>

                <ShadcnTabsContent value="password">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Password Security
                  </h4>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Update your account credentials and multi-factor authentication methods.
                  </p>
                </ShadcnTabsContent>

                <ShadcnTabsContent value="preferences">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Notification Settings
                  </h4>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Configure desktop alerts, sounds, and digest emails.
                  </p>
                </ShadcnTabsContent>
              </ShadcnTabs>
            </div>
          </div>
        </section>

        {/* Section 3: Disclosure & Accordion */}
        <section aria-labelledby="disclosure-section-heading" className="space-y-4">
          <div>
            <h2 id="disclosure-section-heading" className="text-2xl font-bold tracking-tight">
              3. Handmade Disclosure & Accordion Components
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Implements WAI-ARIA disclosure pattern with native button semantics, <code className="text-xs bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded">aria-expanded</code>, <code className="text-xs bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded">aria-controls</code>, and accordion header arrow navigation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Single Disclosure */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Single Disclosure (Collapsible)
              </h3>
              <HandmadeDisclosure defaultOpen={false}>
                <HandmadeDisclosureTrigger>
                  <span>What is a WAI-ARIA Disclosure?</span>
                </HandmadeDisclosureTrigger>
                <HandmadeDisclosureContent>
                  <p>
                    A disclosure is a button that controls the visibility of a section of content.
                    When the content is expanded and visible, the button has <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">aria-expanded="true"</code>.
                    When collapsed, it is set to <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">aria-expanded="false"</code>.
                  </p>
                </HandmadeDisclosureContent>
              </HandmadeDisclosure>
            </div>

            {/* Accordion */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
              <h3 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Multi-Item Accordion
              </h3>
              <HandmadeAccordion type="single" defaultValue="item-1">
                <HandmadeAccordionItem value="item-1">
                  <HandmadeAccordionTrigger>
                    <span>1. Focus Management Standards</span>
                  </HandmadeAccordionTrigger>
                  <HandmadeAccordionContent>
                    Focus must never become trapped in non-modal components, and must always be visible with strong contrast.
                  </HandmadeAccordionContent>
                </HandmadeAccordionItem>

                <HandmadeAccordionItem value="item-2">
                  <HandmadeAccordionTrigger>
                    <span>2. Semantic HTML vs ARIA Overrides</span>
                  </HandmadeAccordionTrigger>
                  <HandmadeAccordionContent>
                    First rule of ARIA: If you can use a native HTML element or attribute with the semantics and behavior already built in, do so instead of re-purposing an element with ARIA.
                  </HandmadeAccordionContent>
                </HandmadeAccordionItem>

                <HandmadeAccordionItem value="item-3">
                  <HandmadeAccordionTrigger>
                    <span>3. Keyboard Predictability</span>
                  </HandmadeAccordionTrigger>
                  <HandmadeAccordionContent>
                    All interactive widgets should support standard keys: Enter and Space for activation, Escape for dismissal, and arrow keys for roving indices.
                  </HandmadeAccordionContent>
                </HandmadeAccordionItem>
              </HandmadeAccordion>
            </div>
          </div>
        </section>

        {/* Section 4: Keyboard Test Checklist */}
        <section aria-labelledby="checklist-section-heading" className="space-y-4">
          <KeyboardChecklist />
        </section>
      </div>
    </div>
  )
}
