import * as React from "react"

interface ChecklistItem {
  id: string
  component: string
  action: string
  expected: string
  keys: string[]
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Dialog Tests
  {
    id: "dialog-1",
    component: "Dialog",
    action: "Open Dialog",
    expected: "Trigger button receives focus, pressing Space/Enter opens dialog. Initial focus moves to first interactive element or dialog body.",
    keys: ["Enter", "Space"],
  },
  {
    id: "dialog-2",
    component: "Dialog",
    action: "Focus Trapping (Tab)",
    expected: "Pressing Tab from last focusable element in dialog wraps focus back to the first focusable element.",
    keys: ["Tab"],
  },
  {
    id: "dialog-3",
    component: "Dialog",
    action: "Reverse Focus Trapping (Shift+Tab)",
    expected: "Pressing Shift+Tab from first focusable element wraps focus to the last focusable element inside the dialog.",
    keys: ["Shift + Tab"],
  },
  {
    id: "dialog-4",
    component: "Dialog",
    action: "Escape to Close",
    expected: "Pressing Escape closes the dialog immediately.",
    keys: ["Escape"],
  },
  {
    id: "dialog-5",
    component: "Dialog",
    action: "Focus Restoration",
    expected: "After closing dialog via Escape or Close button, keyboard focus restores precisely to the original trigger button.",
    keys: ["Escape", "Enter", "Space"],
  },

  // Tabs Tests
  {
    id: "tabs-1",
    component: "Tabs",
    action: "Roving Tabindex Entry",
    expected: "Tabbing into the tablist lands only on the active/selected tab (`tabIndex={0}`). Inactive tabs are bypassed (`tabIndex={-1}`).",
    keys: ["Tab"],
  },
  {
    id: "tabs-2",
    component: "Tabs",
    action: "Horizontal Arrow Navigation",
    expected: "ArrowRight moves focus to the next tab (wraps around). ArrowLeft moves to the previous tab (wraps around).",
    keys: ["ArrowRight", "ArrowLeft"],
  },
  {
    id: "tabs-3",
    component: "Tabs",
    action: "Home & End Keys",
    expected: "Home key moves focus immediately to the first tab; End key moves focus to the last tab.",
    keys: ["Home", "End"],
  },
  {
    id: "tabs-4",
    component: "Tabs",
    action: "Tab into Panel Content",
    expected: "Pressing Tab from the active tab moves keyboard focus directly into the active tab panel.",
    keys: ["Tab"],
  },

  // Disclosure Tests
  {
    id: "disclosure-1",
    component: "Disclosure",
    action: "Toggle Expand / Collapse",
    expected: "Pressing Enter or Space on disclosure trigger toggles `aria-expanded` and reveals/hides content panel.",
    keys: ["Enter", "Space"],
  },
  {
    id: "disclosure-2",
    component: "Disclosure",
    action: "Focus Flow into Content",
    expected: "When disclosure is open, pressing Tab moves focus naturally to focusable content within the panel.",
    keys: ["Tab"],
  },
  {
    id: "disclosure-3",
    component: "Accordion",
    action: "Accordion Arrow Navigation",
    expected: "ArrowUp and ArrowDown navigate between adjacent accordion header triggers with wrapping.",
    keys: ["ArrowDown", "ArrowUp"],
  },
]

export function KeyboardChecklist() {
  const [checkedItems, setCheckedItems] = React.useState<Record<string, boolean>>({})

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const completedCount = Object.values(checkedItems).filter(Boolean).length
  const totalCount = CHECKLIST_ITEMS.length

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Keyboard Accessibility Test Checklist
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manual verification matrix for WAI-ARIA keyboard navigation patterns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            Tested: {completedCount} / {totalCount}
          </span>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => setCheckedItems({})}
              className="text-xs text-neutral-500 underline hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs font-semibold uppercase text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <th className="py-2 pr-3 text-center">Status</th>
              <th className="py-2 pr-3">Component</th>
              <th className="py-2 pr-3">Action</th>
              <th className="py-2 pr-3">Keys</th>
              <th className="py-2">Expected Behavior</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {CHECKLIST_ITEMS.map((item) => {
              const isChecked = !!checkedItems[item.id]
              return (
                <tr
                  key={item.id}
                  className={isChecked ? "bg-green-50/50 dark:bg-green-950/20" : ""}
                >
                  <td className="py-3 pr-3 text-center">
                    <input
                      type="checkbox"
                      id={`chk-${item.id}`}
                      checked={isChecked}
                      onChange={() => toggleCheck(item.id)}
                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Mark "${item.action}" as tested`}
                    />
                  </td>
                  <td className="py-3 pr-3 font-medium text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                    {item.component}
                  </td>
                  <td className="py-3 pr-3 font-semibold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                    <label htmlFor={`chk-${item.id}`} className="cursor-pointer">
                      {item.action}
                    </label>
                  </td>
                  <td className="py-3 pr-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {item.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[11px] font-mono text-neutral-700 shadow-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-neutral-600 dark:text-neutral-300">
                    {item.expected}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
