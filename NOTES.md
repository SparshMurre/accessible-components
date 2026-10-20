# Accessibility Analysis: Handmade Components vs. shadcn/ui (Radix Primitives)

## Executive Summary

During the implementation of FE-05, we developed handmade accessible implementations of **Dialog**, **Tabs**, and **Disclosure/Accordion** components adhering strictly to WAI-ARIA authoring practices. We then initialized `shadcn/ui` (leveraging Tailwind CSS v4 and Radix UI primitives) and inspected the generated component wrappers and their underlying primitives (`@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `@radix-ui/react-focus-scope`, `@radix-ui/react-focus-guards`, `@radix-ui/react-dismissable-layer`).

While the handmade components successfully satisfy basic keyboard traversal and ARIA roles (roving tabindex, dialog focus trap on `Tab`, `Escape` dismissal, focus restoration to trigger), deep source inspection reveals **critical accessibility and edge-case gaps** present in naive handmade implementations.

Below are detailed analyses of at least three concrete accessibility gaps identified between the handmade components and the battle-tested shadcn/ui (Radix) primitives.

---

## Gap 1: Dialog Background Inertness & Assistive Tech Isolation (`aria-hidden` vs Keyboard-Only Trapping)

### The Handmade Implementation
In our handmade `HandmadeDialog`, focus trapping is achieved via a `keydown` event listener attached to the dialog container:
- It listens for `Tab` and `Shift+Tab`.
- It finds all focusable query elements inside the modal content.
- It prevents the default tab behavior when reaching the boundary element and manually shifts focus to the first or last focusable child.

### Why This Fails in Production
1. **Screen Reader Virtual Cursor Escape (No DOM Inertness)**:
   - Screen reader users (such as VoiceOver on macOS/iOS, NVDA/JAWS on Windows, TalkBack on Android) navigate web content using **virtual cursor reading modes** (rotor, arrow keys in browse mode, swipe gestures).
   - In the handmade dialog, DOM elements outside the portal remain interactive and exposed in the accessibility tree because they lack `aria-hidden="true"` or HTML `inert`.
   - While `Tab` is trapped, a screen reader user pressing `Down Arrow` or swiping right can step completely outside the modal dialog into background page content (navigation links, underlying forms, footers).
2. **Missing Boundary Focus Guards**:
   - If a keyboard user tabs out of browser UI (address bar, browser dev tools, bookmarks bar), or if focus leaves the window, focus can re-enter from outside.
   - The handmade component only traps focus if the user is already inside the container pressing `Tab`.

### How shadcn/ui / Radix Solves This
- **`hideOthers` from `aria-hidden`**:
  `@radix-ui/react-dialog` invokes `hideOthers(contentElement)` upon opening. This traverses sibling DOM trees up to the document root and assigns `aria-hidden="true"` to every other element outside the dialog's portal tree. When the dialog unmounts, original attributes are cleanly restored.
- **Focus Guards (`@radix-ui/react-focus-guards`)**:
  Radix mounts hidden sentinel elements with `tabIndex={0}` (`data-radix-focus-guard`) at `document.body.firstElementChild` and `document.body.lastElementChild`. Any attempt by the browser to cycle focus past the page boundaries is intercepted by these guards and redirected back inside the active focus scope.
- **`MutationObserver` Recovery**:
  In `@radix-ui/react-focus-scope`, if a focused interactive element is dynamically removed from the DOM (e.g. an inline deletion or form step transition), the browser resets focus to `document.body`. Radix's `MutationObserver` detects that the focused element was removed and immediately refocuses the dialog container, preventing focus from being dropped onto the background page.

---

## Gap 2: Tabs Internationalization (RTL/LTR Support) & Dynamic Roving Focus

### The Handmade Implementation
Our `HandmadeTabs` component implements roving tabindex by intercepting `ArrowLeft` and `ArrowRight`:
```ts
if (orientation === "horizontal") {
  if (e.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % tabButtons.length
  } else if (e.key === "ArrowLeft") {
    nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length
  }
}
```

### Why This Fails in Production
1. **Right-to-Left (RTL) Layout Inversion**:
   - In RTL reading systems (such as Arabic, Hebrew, Persian, or Urdu), visual direction is flipped.
   - Per the WAI-ARIA Tabs pattern specification:
     - In LTR: `ArrowRight` moves to the next tab; `ArrowLeft` moves to the previous tab.
     - In RTL: `ArrowRight` MUST move to the *previous* tab; `ArrowLeft` MUST move to the *next* tab.
   - Our handmade component hardcodes left-to-right increment/decrement. If an application is rendered under `<html dir="rtl">` or within an RTL parent, keyboard navigation moves in the exact opposite direction of visual perception.
2. **Dynamic Tab Collections & Disabled Item Edge Cases**:
   - In our handmade implementation, tabs are queried via `querySelectorAll('[role="tab"]')`. If tabs are dynamically rendered, reordered, or disabled based on server responses, the index mapping can become stale.
   - If all tabs in a tablist are disabled, the handmade modulo indexing can enter an infinite loop or throw `NaN`/`undefined` errors when attempting to focus `tabButtons[nextIndex]`.

### How shadcn/ui / Radix Solves This
- **Directional Awareness (`@radix-ui/react-direction`)**:
  Radix inspects the computed reading direction via `useDirection(dir)` (inheriting from the closest `dir` HTML attribute or React context). In `@radix-ui/react-roving-focus`, arrow key handlers calculate navigation step deltas based on whether the resolved direction is `ltr` or `rtl`, ensuring arrow keys always match the visual layout direction.
- **Roving Focus Group Collections (`@radix-ui/react-roving-focus`)**:
  Radix maintains a managed item collection using unique item registrations. When navigating, disabled items are safely bypassed using a verified candidate search (`getNextCandidate`, `getPrevCandidate`). If all items are disabled, focus navigation gracefully no-ops without errors.

---

## Gap 3: Nested Layers, Dismissal Stacking, and Layout-Shift-Free Scroll Locking

### The Handmade Implementation
- **Scroll Locking**:
  Handmade dialog modifies `document.body.style.overflow = "hidden"`. On desktop browsers with default scrollbars, this immediately removes the 15-17px vertical scrollbar, causing the entire webpage content to visibly jump horizontally (layout shift).
- **Nested Dialogs & Popovers**:
  The handmade dialog uses a simple single ref `previousActiveElementRef`. If a dialog opens a confirmation sub-dialog, date picker popover, or dropdown menu, the first dialog's trap fights with the second dialog's trap because both listen for global keydown and focus events.

### How shadcn/ui / Radix Solves This
- **`DismissableLayer` Stack**:
  Radix manages a global stack of dismissable layers (`@radix-ui/react-dismissable-layer`). When a nested popover or alert opens inside a dialog, it registers as a top-layer branch. Pointer events and escape key events are handled strictly in LIFO order (last in, first out), preventing premature closing of parent layers.
- **`react-remove-scroll`**:
  Instead of raw `overflow: hidden`, Radix incorporates scroll locking that calculates the browser's scrollbar width and injects compensating padding right onto the root element, completely eliminating visual layout shifts.

---

## Summary Comparison Matrix

| Accessibility Feature | Handmade Component | shadcn/ui (Radix Primitives) |
| :--- | :--- | :--- |
| **Basic Keyboard Tab Navigation** | Handled via custom keydown listener | Handled via `FocusScope` / `RovingFocusGroup` |
| **Visible Focus Rings** | Handled with `focus-visible:` utilities | Handled with design token rings |
| **Screen Reader Background Isolation** | **Gap**: Background DOM exposed to virtual cursor | Handled via `hideOthers` (`aria-hidden="true"`) |
| **Focus Guards (Browser Chrome Re-entry)** | **Gap**: Not implemented | Handled via sentinel elements (`useFocusGuards`) |
| **Dynamic Element Removal Recovery** | **Gap**: Focus drops to `document.body` | Handled via `MutationObserver` on focus scope |
| **RTL Arrow Key Flipping** | **Gap**: Hardcoded LTR arrow semantics | Handled via `useDirection` in `RovingFocusGroup` |
| **Disabled Item Roving Tabindex** | Naive filter check | Verified candidate iterator |
| **Nested Layer / Popover Stacking** | **Gap**: Traps collide on stacked modals | Global `DismissableLayer` & `FocusScope` stack |
| **Scroll Lock Layout Shift** | **Gap**: Causes horizontal content jump | Compensated scrollbar padding calculation |

---

## Conclusion & Verification Recommendation

Handmade accessible components are valuable for understanding low-level ARIA standards and keyboard mechanics. However, for mission-critical production applications, headless primitives like Radix UI (as provided by shadcn/ui) should be preferred because they resolve subtle assistive technology edge cases, multi-layered focus stacks, internationalization (RTL), and browser focus restoration anomalies that require thousands of lines of defensive code.
