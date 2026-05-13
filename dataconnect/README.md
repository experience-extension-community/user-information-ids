<!--
SPDX-License-Identifier: Apache-2.0
-->

# Data Connect

This folder contains the Ethos Data Connect pipeline that the extension
calls. Import it into your Ethos DC tenant and rename it to match the value
of `extension/src/config/institution.js → dataConnectPipelineName`.

## Files

- `COMMUNITY-experience-personsCredentials-get-ids_v1.0.0.json` — the
  reference pipeline definition. Looks up `alternative-credential-types`
  to resolve credential-type UUIDs by your institution's codes, then
  fetches `persons-credentials` for the authenticated user and emits a
  flat object: `{ bannerId, workdayId, studentNetId, employeeNetId, legacyId }`.

## 5-step adoption walkthrough

1. **Import** the JSON file into your Ethos Data Connect tenant.
2. **Rename** the resource from
   `COMMUNITY-experience-personsCredentials-get-ids` to whatever value you
   set in `extension/src/config/institution.js → dataConnectPipelineName`.
   The card calls Data Connect by that name; the two must match exactly.
3. **Verify each parameter's `default` matches your institution's Ethos
   credential code; override if it differs.** The JSON ships with the
   Ellucian-standard codes pre-set as parameter defaults, which work
   out-of-the-box for most Ethos tenants. Check each one against your
   actual Ethos configuration:
   - `legacyIdCode` — ships as `SDNT` (the Ellucian "pre-Banner / SD-NT"
     student code). If your institution doesn't use a legacy code, leave
     this as-is; the corresponding row is disabled by default in
     `credentialTypes.js`.
   - `workdayIdCode` — ships as `EMPL` (Ellucian's standard Workday
     employee code).
   - `bannerIdType` — ships as `bannerId` (the literal string Ethos uses
     on the `credentials[].type` field for Banner IDs).
   - `studentNetIdCode` — ships as `SNET`.
   - `employeeNetIdCode` — ships as `ENET`.

   Override only if your tenant uses non-standard codes. You can edit the
   `default` fields in the JSON before import, or override at the DC
   resource configuration level after import — both work.
4. **Keep `credentialTypes.js` in sync** with what your pipeline returns.
   The component reads `credentials[ct.key]`, where `ct.key` is one of the
   five response fields above. Adding a new credential type means a) emit
   a new field from the pipeline, b) add a matching `{ key, label, ... }`
   entry to `credentialTypes.js`.
5. **Configure the card in Experience Setup** to provide the
   `ethosApiKey` server-config value. Each card configuration supplies its
   own key.

## Why three lookups?

Ethos models credentials in two places:

- **`persons-credentials`** — the canonical Banner ID, typed as a string code
  (e.g. `"bannerId"`). Looked up directly by `cred.type === bannerIdType`.
- **`alternativeCredentials`** — everything else (Workday EMPL, legacy
  systems, NetIDs). The type field here is a **UUID**, not a string code.
  The pipeline first calls `alternative-credential-types` to map your
  institution's string codes to UUIDs, then uses those UUIDs to filter
  the user's `alternativeCredentials`.

This is why the pipeline has both `bannerIdType` (a string code, used
directly) and the `*Code` parameters (string codes that are resolved to
UUIDs via the first segment).

## Note on the `bannerIdType` parameter

Unlike the alternative-credential codes, `bannerIdType` is consumed
**directly** in the second JavaScriptTransform (the `Set correct Ids`
segment) as `creds.find(cred => cred.type === bannerIdType)`. Set its
value to whatever string your tenant uses for the Banner ID credential
type (commonly the literal `bannerId`).

## Testing the pipeline standalone

Add `testUserId` as an optional parameter and pass a known person ID in
the DC console. The pipeline will return that user's credentials directly
without going through Experience.
