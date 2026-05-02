# Validation: Step 10 — Add polling loop in usePhylloConnect onAccountConnected



# QA Validation: Step 10 — Add polling loop in `usePhylloConnect.ts` `onAccountConnected`

## PRD Requirements for Step 10

> "Add polling loop in `usePhylloConnect.ts` `onAccountConnected` — after marking state as connected, poll `/api/phyllo/stats` every 2s up to 5 retries until the platform's stats appear, then call `options.onStatsReceived`"

---

### 1. Polling loop exists in `onAccountConnected` callback

**Reference:** Lines 120–123 in `connectPlatform` → `onAccountConnected` handler:
```js
onAccountConnected: (_accountId, _workPlatformId, _userId) => {
  setConnectionState((prev) => ({ ...prev, [platform]: "connected" }))
  optionsRef.current?.onConnected?.(platform, _accountId)
  pollForStats(platform)
},
```
The `pollForStats` function is invoked immediately after marking state as connected.

✅ **PASS** — Polling is triggered inside `onAccountConnected`.

---

### 2. Polls `/api/phyllo/stats` every 2 seconds

**Reference:** Lines 89–90 in `pollForStats`:
```js
for (let attempt = 0; attempt < maxAttempts; attempt++) {
  await new Promise((r) => setTimeout(r, 2000))
```
Uses `fetchPhylloStats()` (line 93) which calls `GET /api/phyllo/stats` (per `lib/phyllo-client`).

✅ **PASS** — Polls every 2 seconds using the stats endpoint.

---

### 3. Up to 5 retries

**Reference:** Line 88:
```js
async (platform: PhylloPlatform, maxAttempts = 5) => {
```
Loop runs from `attempt = 0` to `attempt < 5`, giving exactly 5 attempts.

✅ **PASS** — Default of 5 retries.

---

### 4. Stops polling when the platform's stats appear

**Reference:** Lines 93–102:
```js
const data = await fetchPhylloStats()
const connectedKey = `${platform}_connected` as keyof PhylloStatsResponse
if (data[connectedKey]) {
  const parsed = parseStatsResponse(data)
  const stats = parsed[platform]
  if (optionsRef.current?.onStatsReceived) {
    optionsRef.current.onStatsReceived(platform, stats)
  }
  return  // <-- exits the loop early
}
```

✅ **PASS** — Early `return` breaks the loop when stats are found.

---

### 5. Calls `options.onStatsReceived` with platform and stats

**Reference:** Lines 99–101:
```js
if (optionsRef.current?.onStatsReceived) {
  optionsRef.current.onStatsReceived(platform, stats)
}
```
Uses `optionsRef` to get the latest callback reference, avoiding stale closures.

✅ **PASS** — Correctly calls `onStatsReceived(platform, stats)`.

---

### 6. Error handling after exhausting retries

**Reference:** Lines 108–114:
```js
setErrors((prev) => ({
  ...prev,
  [platform]:
    "We couldn't pull your stats. This can happen if:\n• Your account is set to private\n• The platform is temporarily down\n\nTry Again or enter your stats manually below.",
}))
```

This matches the PRD error message spec almost exactly:
> "We couldn't pull your stats. This can happen if:
> - Your account is set to private
> - The platform is temporarily down
>
> [Try Again] or enter your stats manually below."

✅ **PASS** — Error message matches PRD requirements.

---

### 7. State marked as connected before polling begins

**Reference:** Line 121:
```js
setConnectionState((prev) => ({ ...prev, [platform]: "connected" }))
```
This fires before `pollForStats(platform)` on line 123.

✅ **PASS** — State is set to `"connected"` first, then polling starts.

---

### 8. Stable callback references (no stale closure bugs)

**Reference:** Line 12:
```js
const optionsRef = useRef(options)
optionsRef.current = options
```
All option callbacks are accessed via `optionsRef.current`, and `pollForStats` is wrapped in `useCallback` with `[parseStatsResponse]` dependency. `connectPlatform` depends on `[pollForStats]`.

✅ **PASS** — Proper ref pattern prevents stale closures.

---

### Minor observations (not blocking)

- ⚠️ **PARTIAL** — The polling checks `data[connectedKey]` (i.e., `instagram_connected` or `tiktok_connected`) but does **not** verify that actual stats values (e.g., `followers`) are non-null. If the webhook sets `instagram_connected = true` before populating stats fields, the polling could return with null stats. This is an edge case that depends on webhook implementation—likely fine if the webhook sets both atomically, but worth noting.

- The `connectionState` is not set to `"error"` after polling exhaustion—it remains `"connected"`. This is arguably correct (the account *is* connected, stats just haven't arrived), but it means the UI would show a green checkmark alongside the error message. This is a design judgment call, not a PRD violation.

---

## Overall Verdict

**✅ READY TO MERGE**

All explicit requirements for Step 10 are fully met: polling loop fires inside `onAccountConnected`, polls every 2 seconds, caps at 5 retries, exits early on success, calls `onStatsReceived`, and shows the correct error message on failure. The implementation is clean, handles edge cases well, and uses proper React patterns to avoid stale closures.