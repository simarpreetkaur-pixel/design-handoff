# OMNI Support — design language (Figma + product UI)

This file is the **authoritative** description of how to implement OMNI Post-Sales UI in this repo. **Follow it for typography, colour, component choice, and Figma references.**

## Figma source of truth

- **File:** [OMNI — Post-Sales (Figma)](https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8278-63809)  
- **Node:** `8278:63809` — *Incoming call / “Opening call context”* (Dev Mode: frame name `Iteration 12`).  
- In code, the same reference is recorded as `INCOMING_CALL_FIGMA` / `INCOMING_CALL_FIGMA_URL` in `src/design/figma-incoming-call.ts`. Do not duplicate guessed URLs; update that module if the designer moves the frame.

## Typography

- **Primary typeface (product / Figma):** **Euclid Circular B** (Regular 400, Medium 500, Semibold 600 as in the file).  
- **Implementation:** `src/index.css` sets `--font-omni-sans: "Euclid Circular B", "Inter", …`. **Inter** is the approved webfont fallback and loads from Google Fonts in `index.html`. For pixel-perfect Euclid on the web, add licensed **WOFF2** files under `public/fonts/` and extend `@font-face` rules in `index.css` (local files take precedence over `local()` in source order).

## Colour — OMNI / ACKO (from Figma variables)

| Token (Figma)   | Role                          | Where used in UI |
|-----------------|-------------------------------|------------------|
| Neutral N500    | Default heading/body          | e.g. `#36354C`   |
| Neutral N600    | Emphasis, values              | e.g. `#040222`   |
| Text N400       | Secondary labels              | e.g. `#5B5675`   |
| Line N200       | Borders, dividers             | e.g. `#E7E7F0`   |
| Background N100 / header hairline | `border-b` on header  | e.g. `#F0F0F6` |
| Profile surface | User strip background         | e.g. `#F3F7FF`   |
| Quick summary   | AI / summary well             | e.g. `#F8F7FC`   |
| Green G300      | **Primary** CTA, focus ring  | e.g. `#0FA457`   |
| Yellow Y50 / Y500 | “Frustrated caller” badge | e.g. `#FFF7E5` / `#D16900` |
| Purple P300     | Quick-summary icon accent, Simulate button | e.g. `#7C47E1`  |
| Red R400        | End call button (Ozontel)   | e.g. `#D83D37`   |

HSL copies live in `src/index.css` under `:root` and map to Tailwind via `bg-primary`, `text-omni-n500`, etc.

## Components

### Core UI Components
- **Use shadcn primitives** wherever they match: `Dialog` (modals), `Button`, `Card`, `Badge`, `Avatar`, and `ScrollArea` when a bounded scroll region is required.  
- Styling is **Tailwind + `cn()`**; design tokens are **CSS variables** (not one-off random hexes in new components).

### OMNI-Specific Components
- **Homepage** (`src/components/Homepage.tsx`) — Main search interface with ACKO branding, toast notifications
- **IncomingCallModal** (`src/components/IncomingCallModal.tsx`) — Opening call context modal with:
  - Visual circular progress timer (top right) - purple P300 reduces over 60 seconds
  - Pulsating call indicator dots (top left) with dialing animation and updated call icon
  - Auto-timeout with toast notification
  - Key-value pair layout for all fields including "Frustrated caller"
  - P300 purple "Answer Call" button (#7c47e1)
- **OzontelDialer** (`src/components/OzontelDialer.tsx`) — Dialer interface with user profile and call controls
  - Green answer call button: `#0fa457`
  - Positioned above Ozontel icon when active
  - Shows caller details (Rajesh Kumar, +91 98200 25524)

## Viewport

- Modals: **max height** `min(90dvh, 56rem)`, horizontal **gutter** `0.75rem` + **max width** `506px` to match the Figma artboard. Inner content scrolls with `overflow-y: auto` when the viewport is short so **nothing is clipped** on small devices.

## Assets

- **ACKO Logo**: Lives at `public/acko-logo.png` — official ACKO branding asset.
- **Icons**: Use `lucide-react` for UI icons (Search, Phone, etc.) to maintain consistency.
  - Custom icons stored in `public/icons/`: 
    - `sparkle-icon.png` - Quick summary indicator
    - `translate-icon.png` - Language indicator  
    - `award-icon.png` - Customer loyalty indicator
    - `call-indicator.png` - Updated incoming call phone icon (left of "Incoming call" text)
    - `timer-indicator.png` - Timer/countdown icon
    - `user-avatar.png` - User avatar icon (replaces "RK" initials above Rajesh Kumar)
- **Figma assets**: Export and save to `public/figma-assets/` only when needed. Remote MCP asset URLs are **short-lived** — **do not** ship them as the only source.

## Call Flow & State Management

### Two Ways to Access Dialer:
- **Ozontel Dialer Icon** (bottom left) → Opens `OzontelDialer` directly
- **Simulate Live Call** (bottom right) → Opens `IncomingCallModal` + `OzontelDialer` together

### Call Flow:
1. **Simulate Live Call** → Opens modal only, Ozontel icon accessible at z-[60]
2. **Answer Call** (in modal) → Modal stays open, Rajesh Kumar dialer appears at z-[60]
3. **Answer Call** (in Rajesh Kumar) → Both modal AND dialer close instantly, return to homepage

### Alternative Flow:
1. **Ozontel Icon** (direct) → Opens only the Rajesh Kumar dialer
2. **Answer Call** (in Ozontel) → Closes dialer and navigates to the CRM view (`/crm/call/:customerId`)

## CRM View (`/crm/call/:customerId`)

When the agent answers the call from the Ozontel dialer, the app navigates to the
**CRM View** — a three-column working surface for the agent.

### Layout (`src/components/CRMView.tsx`)
- **Top nav**: ACKO logo + "OMNI Support" + back button (height `72px`, same shadow/typography as Homepage).
- **Left panel** (`304px`): `CustomerDetailsPanel` — customer details card + call context card.
- **Center panel** (flex 1): `JTBDPanel` — tabs, JTBD cards, status timeline, agent's next actions, quick related actions.
- **Right panel** (`278px`): `AIChatPanel` — AI companion chat (sticky, full-viewport height).
- **Floating**: `QuickActionsButton` — bottom-right purple pill with dropdown (`Action 1/2/3`).

### Components
- `src/components/crm/CustomerDetailsPanel.tsx` — two cards with `grid-cols-[96px_1fr]` key/value rows; "App status" uses the success token (`#0FA457`).
- `src/components/crm/JTBDPanel.tsx` — three tabs (`Ongoing JTBD (n)`, `Active policies`, `Inactive policies`); active tab uses success pill (`bg-[#e7f7ee] text-[#087a45]`). JTBD cards use the purple P300→P500 gradient (`from-[#7c47e1] to-[#44277b]`) when selected.
- `src/components/crm/ClaimStatusTimeline.tsx` — horizontal 3-step timeline. Completed = green filled dot with white check, current = amber ring with solid dot, pending = hollow neutral circle.
- `src/components/crm/AgentActions.tsx` — numbered P300-badge steps with P300 CTA buttons ("Send Alert", "Send Communication"); "Ask in Chat" pill at the top right; "Quick Related Actions" chip row.
- `src/components/crm/AIChatPanel.tsx` — bot header, empty-state with sparkle, round input + send button. Uses P300 for the send CTA.
- `src/components/crm/QuickActionsButton.tsx` — `#b191ed` pill with bolt icon and animated chevron; dropdown opens upward.

### Data
- Interfaces in `src/types/crm.ts` (`Customer`, `JTBD`, `ClaimStatus`, `AgentAction`).
- Mock data in `src/data/mockCustomers.ts` keyed by `customerId` (currently `rajesh-kumar`).

### Navigation
- `Homepage.handleAnswerCallFromOzontel` uses `useNavigate()` → `navigate("/crm/call/rajesh-kumar")`.
- `CRMView` reads `customerId` via `useParams`, looks up `mockCustomers[customerId]`, renders a fallback screen when missing.

### UI Behavior:
- **Instant modal close**: No animations on modal open/close for immediate response
- **Single-click close**: One click on "Answer Call" in Rajesh Kumar closes both elements simultaneously
- **Controlled state**: Modal can only be closed programmatically or via handleCloseModal function
- **Visual progress timer**: Circular SVG timer with purple P300 stroke that reduces over 60 seconds, auto-closes at 0
- **Call dialing animation**: Three dots with sequential pulsating effect (scale + opacity) simulating call dialing
- **Auto-timeout**: After 60 seconds, modal closes and shows toast notification
- **Toast notification**: "Call transferred to another agent due to inactivity" with auto-hide after 5 seconds

### UI Elements:
- **Bottom Left**: Ozontel dialer icon (`/icons/ozontel-dialer-icon.png`) - exact icon, no container/button
  - Position: `fixed bottom-6 left-6 z-[60]` (24px from bottom/left edges, ABOVE modal level)
  - Size: `h-14 w-14` (56x56px)
  - Dialer appears directly above with 1px padding: `bottom-[5.1rem] z-[60]`
  - **Always accessible** even when modal is open - higher z-index than modal overlay
- **Bottom Right**: "Simulate Live Call" button - purple pill with phone icon

## Development Configuration

- **Standard Port**: Application runs on `http://localhost:4000` (configured with `strictPort: true`)
- **No Port Changes**: Vite will not automatically try other ports if 4000 is occupied

## Z-Index Layering

- **Modal Overlay**: `z-50` (background overlay)
- **Ozontel Icon**: `z-[60]` (above modal, always clickable)
- **Ozontel Dialer**: `z-[60]` (above modal, always accessible)
- **Modal Content**: `z-50` (same level as overlay)
