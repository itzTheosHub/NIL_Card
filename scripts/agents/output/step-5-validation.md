# Validation: Step 5 — Install Phyllo SDK, add connect buttons to ProfileForm



# Validation: Step 5 — Install Phyllo SDK, Add Connect Buttons to ProfileForm

## Relevant PRD Requirements for Step 5

### 1. Install Phyllo Connect SDK
> "Install Phyllo Connect SDK (check docs for npm package name)"

**Cannot fully validate from this file alone.** The `ProfileForm.tsx` imports `PhylloConnectSection` and `usePhylloConnect`, which implies the SDK is installed and wrapped. However, the actual SDK installation (package.json) and the implementations of `PhylloConnectSection`, `usePhylloConnect`, and `phyllo-client` are not provided for review.

- ⚠️ PARTIAL — The imports reference the right abstractions (`PhylloConnectSection`, `usePhylloConnect`, `phyllo-client`), but the actual Phyllo SDK npm package installation and these dependent files are not provided for validation.

---

### 2. "Connect your accounts" section at the top of the form
> "Top of ProfileForm shows 'Connect your accounts' section with two buttons: Instagram and TikTok"

The `<PhylloConnectSection>` component is rendered inside the form card, after the profile photo upload section (around line 214–218). It's positioned **before** Basic Info, Social Links, and Stats — which is consistent with the PRD saying it should be at the "top of the form."

- ⚠️ PARTIAL — The section is placed near the top of the form content but **after** the profile photo upload. The PRD says "Top of ProfileForm." This is arguably fine since profile photo is a visual element, but the actual button rendering (Instagram/TikTok buttons, "Skip for now" links) is delegated to `PhylloConnectSection` which is **not provided** for review. We cannot confirm the two platform buttons or "Skip for now" links exist.

---

### 3. Two platform buttons (Instagram, TikTok) with "Skip for now" link each
> "Each platform has a 'Skip for now' link below its button"

- ❌ FAIL — Cannot validate. The `PhylloConnectSection` component is not provided. We cannot confirm it renders two separate platform buttons with individual "Skip for now" links.

---

### 4. Connected state: green checkmark + "Refresh Stats" + "Disconnect"
> "Connected: Green checkmark + platform name + 'Refresh Stats' button + 'Disconnect' button"

- ❌ FAIL — Cannot validate. This UI would live inside `PhylloConnectSection`, which is not provided.

---

### 5. On successful connect: auto-populate `total_followers`, `avg_views`, `engagement_rate` fields
> "On successful connect: auto-populate total_followers, avg_views, engagement_rate fields"

The `handlePhylloStatsReceived` callback (lines ~169–203) does the following:
- Sets `engagementRate` on `formData` if `stats.engagementRate` is available ✅
- Sets `avgViews` on `formData` if `stats.avgViews` is available ✅
- Updates or adds the matching social link's `followers` count (which feeds into auto-calculated `totalFollowers`) ✅
- Also auto-fills `username` on the social link ✅ (PRD: "Username/handle — auto-fills their social link field")

The `handlePhylloConnected` callback (lines ~206–214) adds a social link entry for the platform if one doesn't already exist ✅

- ✅ PASS — The auto-population logic in `ProfileForm.tsx` correctly handles engagement rate, avg views, followers, and username. The `totalFollowers` is auto-calculated from social links (line ~256).

---

### 6. On error: show inline error message with reasons + Try Again button
> "If Phyllo fails to pull stats, show an inline error message below the connect button..."

- ❌ FAIL — Cannot validate. Error handling UI would be in `PhylloConnectSection` or `usePhylloConnect`, neither of which is provided. `ProfileForm.tsx` itself has no Phyllo-specific error handling or inline error rendering for failed connections.

---

### 7. Handle SDK callbacks: `onExit`, `onAccountConnected`, `onAccountDisconnected`
> "Handle onExit, onAccountConnected, onAccountDisconnected SDK callbacks"

`ProfileForm.tsx` passes three callbacks to `PhylloConnectSection`:
- `onStatsReceived` — handles post-connection data population ✅
- `onConnected` — maps to `onAccountConnected` ✅
- `onDisconnected` — maps to `onAccountDisconnected` ✅
- `onExit` — **NOT passed** to `PhylloConnectSection` ❌

- ⚠️ PARTIAL — `onExit` callback is not wired up from `ProfileForm.tsx`. Two of three required SDK callbacks are represented. `onExit` may be handled internally by `PhylloConnectSection`, but we can't confirm.

---

### 8. Load SDK on button click with the token from `/api/phyllo/create-token`
> "Load SDK on button click with the token from /api/phyllo/create-token"

- ❌ FAIL — Cannot validate. This logic would be in `usePhylloConnect` or `PhylloConnectSection`, neither provided.

---

### 9. Username/handle auto-fills social link field
> "Username/handle — auto-fills their social link field"

In `handlePhylloStatsReceived` (line ~194): `username: stats.username ? \`@${stats.username}\` : updated[idx].username` — correctly auto-fills the username field on the matching social link.

- ✅ PASS

---

### 10. Athletes can edit or delete auto-populated values
> "Athlete reviews populated fields, can edit or delete any values they don't want"

The form fields for `engagementRate`, `avgViews`, and social link `followers`/`username` are all rendered as editable `<Input>` components. Social links have a remove button (X icon). Stats fields are standard inputs.

- ✅ PASS

---

### 11. Disconnect does not clear stats already saved
> "Disconnect removes the Phyllo connection for that platform (does not clear the stats already saved)"

The `handlePhylloDisconnected` callback (lines ~217–220) explicitly leaves the social link in place with a comment: `// We leave the social link in place so the user can still edit manually`.

- ✅ PASS

---

## Summary Table

| Requirement | Status |
|---|---|
| Install Phyllo SDK | ⚠️ PARTIAL — dependent files not provided |
| "Connect your accounts" section at top of form | ⚠️ PARTIAL — placement OK, but child component not provided |
| Two platform buttons + "Skip for now" | ❌ FAIL — cannot validate (PhylloConnectSection missing) |
| Connected state UI (checkmark, refresh, disconnect) | ❌ FAIL — cannot validate (PhylloConnectSection missing) |
| Auto-populate stats on connect | ✅ PASS |
| Error handling UI | ❌ FAIL — cannot validate (PhylloConnectSection missing) |
| SDK callbacks (onExit, onAccountConnected, onAccountDisconnected) | ⚠️ PARTIAL — onExit not wired |
| Load SDK on button click with token | ❌ FAIL — cannot validate |
| Username auto-fill | ✅ PASS |
| Editable auto-populated fields | ✅ PASS |
| Disconnect preserves existing stats | ✅ PASS |

---

## Overall Verdict

### ❌ NEEDS WORK

**Critical blockers:**
1. **Missing files for review:** `PhylloConnectSection`, `usePhylloConnect` hook, and `lib/phyllo-client` are all imported but not provided. The majority of Step 5's PRD requirements (platform buttons, "Skip for now" links, connected state UI, error handling UI, SDK loading) are delegated to these components and **cannot be validated**.
2. **`onExit` SDK callback** is not passed from `ProfileForm.tsx` to `PhylloConnectSection`. The PRD explicitly lists it as a required callback to handle.

**What's working well in `ProfileForm.tsx`:**
- The auto-population logic (`handlePhylloStatsReceived`) is well-implemented and correctly maps Phyllo stats to form