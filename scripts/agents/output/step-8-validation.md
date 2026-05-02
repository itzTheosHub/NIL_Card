# Validation: Step 8 — Wire up connected state UI (checkmark, refresh, disconnect)



# QA Validation: Step 8 — Wire up connected state UI (checkmark, refresh, disconnect)

## Scope of Validation

Step 8 focuses on wiring up the connected state UI in ProfileForm.tsx, including: green checkmark for connected platforms, refresh stats button, disconnect button, and integration with the PhylloConnectSection component.

---

## Requirement-by-Requirement Assessment

### 1. "Connect your accounts" section at the top of the form (ProfileForm)

**PRD:** "Top of ProfileForm shows 'Connect your accounts' section with two buttons: Instagram and TikTok"

The `<PhylloConnectSection>` component is rendered inside the form's CardContent (line ~170), which is appropriately placed near the top of the form, after the profile photo upload.

✅ **PASS** — PhylloConnectSection is rendered at the top of the form. The actual button rendering is delegated to PhylloConnectSection (not included in this file but referenced).

---

### 2. Connected state: green checkmark + "Refresh Stats" + "Disconnect"

**PRD:** "Connected state: green checkmark + platform name + 'Refresh Stats' button + 'Disconnect' button"

This behavior is delegated to `PhylloConnectSection` component, which is imported but its source code is **not provided** for this review. ProfileForm.tsx passes three callbacks (`onStatsReceived`, `onConnected`, `onDisconnected`) to it, which is the correct wiring pattern.

⚠️ **PARTIAL** — The wiring from ProfileForm to PhylloConnectSection is correct (callbacks are properly defined and passed as props at lines ~100–130 and ~170–174). However, **PhylloConnectSection.tsx source is not provided**, so we cannot verify the green checkmark, "Refresh Stats" button, or "Disconnect" button are actually rendered.

---

### 3. On successful connect: auto-populate `total_followers`, `avg_views`, `engagement_rate` fields

**PRD:** "On successful connect: auto-populate total_followers, avg_views, engagement_rate fields"

**`handlePhylloStatsReceived` (lines ~100–131):**
- ✅ Sets `formData.engagementRate` from `stats.engagementRate`
- ✅ Sets `formData.avgViews` from `stats.avgViews`
- ✅ Updates/adds social link with `stats.followers` and `stats.username` (which feeds into auto-calculated `totalFollowers`)

✅ **PASS** — All three stat fields are auto-populated correctly.

---

### 4. Username/handle auto-fills social link field

**PRD:** "Username/handle — auto-fills their social link field"

In `handlePhylloStatsReceived` (lines ~120–130), when `stats.username` is available, it updates the matching social link's `username` field with `@${stats.username}`.

✅ **PASS**

---

### 5. `handlePhylloConnected` — adds social link entry for platform if missing

**PRD:** Implicit from the UX flow — connecting a platform should make it visible in the social links section.

`handlePhylloConnected` (lines ~134–141) checks if a social link for the platform already exists and adds one if missing.

✅ **PASS**

---

### 6. `handlePhylloDisconnected` — does not clear stats already saved

**PRD:** "'Disconnect' removes the Phyllo connection for that platform (does not clear the stats already saved)"

`handlePhylloDisconnected` (lines ~144–147) is intentionally a no-op with a comment explaining: "We leave the social link in place so the user can still edit manually."

✅ **PASS** — Matches PRD requirement that disconnect does not clear saved stats.

---

### 7. Athlete can edit or delete any auto-populated values

**PRD:** "Athlete reviews populated fields, can edit or delete any values they don't want"

- Engagement rate and avg views are editable `<Input>` fields (lines ~315–340)
- Social link followers and username are editable `<Input>` fields (lines ~265–285)
- Social links have a remove button (line ~287–294)

✅ **PASS**

---

### 8. "Skip for now" link for each platform

**PRD:** "Each platform has a 'Skip for now' link below its button"

This would be inside `PhylloConnectSection` — **not provided for review**.

⚠️ **PARTIAL** — Cannot verify from the provided code. The wiring is correct from ProfileForm's side but the actual "Skip for now" UI is in the child component.

---

### 9. Error handling with inline error message

**PRD:** "If Phyllo fails to pull stats, show an inline error message below the connect button" with specific copy and a "Try Again" button.

Error handling UI would be inside `PhylloConnectSection` — **not provided for review**. ProfileForm.tsx does have a general `error` state displayed at the bottom (line ~531), but the Phyllo-specific inline error per the PRD would need to be in PhylloConnectSection.

⚠️ **PARTIAL** — Cannot verify Phyllo-specific error handling from this file alone.

---

### 10. Two platform buttons: Instagram and TikTok (Phyllo section)

**PRD:** "Two platform buttons: Instagram and TikTok" in the connect section.

Delegated to `PhylloConnectSection`. The type import `PhylloPlatform` from `@/lib/phyllo-client` suggests this is properly typed.

⚠️ **PARTIAL** — Cannot verify from provided code.

---

### 11. Manual fallback always available

**PRD:** "Both 'Try Again' and manual input are always available as fallbacks."

The social links section (lines ~246–308) always allows manual addition of platforms and manual editing of followers/username. The stats section (lines ~310–345) always shows editable engagement rate and avg views fields.

✅ **PASS** — Manual input is always available regardless of Phyllo connection state.

---

## Issues Found

### Minor Issues

1. **Line ~145**: `_platform` parameter in `handlePhylloDisconnected` uses underscore convention correctly, but the callback signature uses `PhylloPlatform` type — this is fine but the no-op might surprise future developers. The comment is helpful.

2. **No explicit "not connected" vs "connected" state management in ProfileForm.tsx**: The connected state tracking (instagram_connected, tiktok_connected booleans) appears to be managed entirely in PhylloConnectSection, not in ProfileForm. This is an acceptable architecture but means ProfileForm doesn't have visibility into connection state for conditional rendering.

---

## Summary

| # | Requirement | Status |
|---|------------|--------|
| 1 | Connect section at top of form | ✅ PASS |
| 2 | Green checkmark + Refresh + Disconnect | ⚠️ PARTIAL (delegated to PhylloConnectSection, not provided) |
| 3 | Auto-populate stats on connect | ✅ PASS |
| 4 | Auto-fill username/handle | ✅ PASS |
| 5 | Add social link on connect | ✅ PASS |
| 6 | Disconnect doesn't clear saved stats | ✅ PASS |
| 7 | Athlete can edit/delete auto-populated values | ✅ PASS |
| 8 | "Skip for now" per platform | ⚠️ PARTIAL (in child component) |
| 9 | Inline error handling with Try Again | ⚠️ PARTIAL (in child component) |
| 10 | Instagram + TikTok buttons | ⚠️ PARTIAL (in child component) |
| 11 | Manual fallback always available | ✅ PASS |

---

## Overall Verdict

**NEEDS WORK**

The ProfileForm.tsx wiring is well-implemented — callbacks are properly defined, stats auto-population logic is correct, and manual fallback is always available. However, **the critical missing piece is the `PhylloConnectSection.tsx` component**, which is where the core Step 8 UI lives (green checkmark, Refresh Stats button, Disconnect button, connected vs. not-connected states, "Skip for now" links, and inline error messages). Without reviewing that component, we cannot confirm that Step 8's primary deliverables