# ROADMAP

## What this builds toward

A self-managed host tool that reduces coordination friction and catches revenue leaks before they cost you bookings. v1 is a dashboard that answers "what needs my attention today." v4 is a fully integrated operations platform with TIDY job automation.

---

## v1: Dashboard with Daily Briefing (current focus)

**Goal:** Open the dashboard and immediately know what's happening and what action is needed today. Show 4 weeks of upcoming bookings, surface unbookable gaps, track cleaner coordination progress.

**Done when:** A host can open the dashboard, read the briefing, see which bookings need cleaner confirmation, and identify revenue leaks from unbookable gaps — all in under 60 seconds.

---

### Task 1: Lovable UI shell (complete)

Full dashboard layout with mocked data. Briefing panel, booking cards with three-step checklist, gaps table. Checklist tap-to-toggle behavior included.

Files: `src/client/Briefing.tsx`, `src/client/BookingCard.tsx`, `src/client/Checklist.tsx`, `src/client/GapsTable.tsx`, `src/client/types.ts`, `src/routes/index.tsx`

---

### Task 2: Supabase and property config setup (~1 hour)

Three tables:
- `checklist_state`: columns `property_id`, `booking_id`, `step` (notified/confirmed/reminder/ready/checkedIn/checkedOut/reviewed), `completed` (boolean). Steps split into two groups in the UI: cleaner coordination (notified/confirmed/reminder/ready) and guest stay (checkedIn/checkedOut/reviewed).
- `briefings`: columns `id`, `property_id`, `date`, `text`, `context` (jsonb — bookings, gaps, checklist state captured at briefing generation time).
- `briefing_feedback`: columns `briefing_id` (fk → briefings), `helpful` (boolean), `submitted_at`. Anchored to the briefing so each vote is attached to the exact state the AI saw.

Secret URL scheme: property_id in the URL path. Row-level security filters all queries by property_id. Anyone with the URL can read and write.

Create `.env.example` with `SUPABASE_URL`, `SUPABASE_KEY`, `PROPERTY_ID`.

Create `config/property.json` to hold non-secret property identity. Schema:
```json
{
  "propertyName": "Mountain Loft #1",
  "cleanerName": "Maria",
  "icalUrl": "https://calendar.google.com/calendar/ical/.../basic.ics"
}
```
`icalUrl` will be consumed by Task 3, `cleanerName` by Task 7's prompt builder, `propertyName` for display. Treat the committed file as a placeholder template — real values are filled in per deployment. Validate schema on server startup; log error and refuse to start if `icalUrl` is missing or empty.

Files: `src/db/supabase.js`, `.env.example`, `config/property.json`

---

### Task 3: Google Calendar integration (~1.5 hours)

Fetch 4-week rolling window from Google Calendar. Parse iCal format into booking objects: `{id, checkIn, checkOut, nights, turnaroundWindow}`.

Turnover window logic: checkout time to check-in time on consecutive bookings. Default: 10am checkout, 4pm check-in.

Files: `src/api/gcal.js`, `src/engine/calendar.js`

---

### Task 4: Gaps engine (~1 hour)

Pure function. Input: sorted array of bookings. Output: array of gaps `{startDate, endDate, nights}`.

Unit test cases inline as comments:
- Back-to-back bookings (no gap)
- Single-night gap
- Multi-night gap
- Multiple gaps in the window

Files: `src/engine/gaps.js`

---

### Task 5: PriceLabs integration (~1.5 hours)

Fetch nightly prices and min stay settings for gap dates. Join to gaps output. Flag gaps where `gap.nights < minStay`.

Note: PriceLabs API costs $1/listing/month. Confirm before wiring.

Files: `src/api/pricelabs.js`

---

### Task 6: Briefing rules config (~1 hour)

Create `config/briefing-rules.json` schema:
```json
{
  "includeTurnovers": true,
  "includeGaps": true,
  "gapFlagThreshold": 3,
  "tone": "direct",
  "customRules": [
    "Flag if cleaner not confirmed within 48 hours of check-in",
    "Mention open maintenance items if any exist"
  ]
}
```

Validate schema on server startup. Log error and use defaults if invalid.

Create `config/README.md` explaining every field and what happens if one is missing.

Files: `config/briefing-rules.json`, `config/README.md`

---

### Task 7: Claude briefing (~1.5 hours)

`buildPrompt(bookings, gaps, checklistState, briefingRules)` in `src/engine/briefing.js`. Returns prompt string. No API calls. Reads `briefing-rules.json` and injects rules into the prompt.

Server route `/api/briefing`: loads config, calls `buildPrompt`, calls Claude API, stores the briefing text and the day's context (bookings, gaps, checklist state) in the `briefings` table, returns `{briefingId, text}`.

Files: `src/engine/briefing.js`, `src/api/claude.js`, `src/server/routes.js`

---

### Task 8: Feedback mechanism (~1 hour)

The thumbs up/down buttons already render in `Briefing.tsx` with prop signature `<Briefing id={...} text={...} onFeedback={(helpful: boolean) => void} />`. Wire `onFeedback` to POST `/api/feedback` with `{briefingId, helpful}`. Server writes to the `briefing_feedback` table, linking back to the `briefings` row by id.

After click, both buttons are disabled (greyed out) for that briefing — no toast, no other UI feedback. After 2 weeks, query Supabase for unhelpful briefings (joining `briefings` and `briefing_feedback`) to review the briefing text + context and adjust `briefing-rules.json`.

Files: `src/client/Briefing.tsx`, `src/server/routes.js`

---

### Task 9: Wire everything (~2 hours)

Replace all mocked data with live data:
- Bookings from Google Calendar
- Gaps from gaps engine + PriceLabs pricing
- Checklist state from Supabase
- Briefing from Claude

Connect checklist toggles to Supabase write. Wire notes textarea to debounced Supabase write — the `saving`/`saved` icon in `BookingCard` already exists with an 800ms timer; replace the timer-based reset with a transition that fires after `supabase.update()` resolves (and surfaces a third `error` state on failure). Confirm secret URL works across two browsers (different devices, same property_id).

Files: `src/client/App.jsx`, all components

---

### Task 10: Documentation (~1 hour)

CLAUDE.md (done), ROADMAP.md (this file), README.md.

README covers:
- What it is (one sentence)
- How to run locally (install, env vars, `npm run dev`)
- How to configure `config/property.json` and `config/briefing-rules.json`
- Screenshot of the dashboard
- No marketing copy

Files: `README.md`

---

## v2: Inventory Tracker

Checklist of restocking items (toilet paper, coffee, shampoo) that depletes after each turnover. Items below threshold surface automatically in the briefing and in the cleaner message on the booking card.

Explore integration with TIDY for automatic inventory syncing if TIDY supports it.

---

## v3: TIDY Integration (Cleaner Coordination)

Replace manual cleaner checklist with TIDY job scheduling. The dashboard pulls job status from TIDY's API instead of storing it in Supabase.

Checklist becomes:
- Job created (TIDY)
- Job assigned (TIDY)
- Job completed (TIDY)

The briefing surfaces TIDY job issues: unassigned jobs, late completions, cleaner no-shows.

Reference: https://www.tidy.com/blog/claude-code-str-property-management

---

## v4: TIDY Integration (Maintenance Tracking)

TIDY handles maintenance requests. Instead of a local maintenance log, surface open TIDY maintenance jobs in the briefing and booking cards.

The gaps table flags properties with open maintenance that might prevent bookings.

---

## v5: Write-back to PriceLabs

Allow min stay adjustments directly from the gaps table. Click "Drop to 2 nights" on a gap row, dashboard writes back to PriceLabs API.

This is the first write operation to an external system. Requires confirmation dialog and human approval before executing.
