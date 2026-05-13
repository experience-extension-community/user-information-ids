<!--
SPDX-License-Identifier: Apache-2.0
-->

# Architecture

A short tour of how the pieces fit together and why the parameterization
surface is split the way it is.

## Data flow

```
                         ┌──────────────────────────┐
                         │  Ethos Data Connect      │
                         │  pipeline (named in      │
                         │  institution.js)         │
                         └────────────┬─────────────┘
                                      │  JSON: { bannerId, workdayId, ... }
                                      ▼
                         ┌──────────────────────────┐
                         │  useData()               │
                         │  authenticatedEthosFetch │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────┴─────────────┐
                         │ UserInformationCard.jsx  │
                         │      Home.jsx (page)     │
                         └────────────┬─────────────┘
                                      │
                  ┌───────────────────┼─────────────────┐
                  ▼                   ▼                 ▼
        ┌──────────────────┐  ┌─────────────┐  ┌───────────────┐
        │ credentialTypes  │  │ roles       │  │ tokens        │
        │   (which rows,   │  │ (which role │  │  (colors)     │
        │   in what order, │  │  strings    │  │               │
        │   email-compose) │  │  mean what) │  │               │
        └──────────────────┘  └─────────────┘  └───────────────┘
                  │
                  ▼
        ┌──────────────────┐
        │   IdField.jsx    │  (one per enabled credential that has a value)
        │   label, value,  │
        │   copy-on-click  │
        └──────────────────┘
```

## The parameterization surface

Five files. Adopters edit these, nothing else.

### `src/config/institution.js`

Single-source-of-truth for institution identity. Loaded by **both** the
React bundle (Webpack) and the build-time manifest (Node loading
`extension.js`), so it's authored in CommonJS for dual consumption.

What's in it:
- `publisher`, `extensionName` — display strings, must match `package.json`
  `name`.
- `dataConnectPipelineName` — the Ethos DC resource the card calls.
- `studentEmailDomain`, `employeeEmailDomain` — composed onto NetIDs when a
  credentialType says `composeEmail: { domainKey: 'studentEmailDomain' }`. Set
  either to `null` to disable composing.
- `typekit` — `href`, `linkId`, `primaryFontFamily`. The font loader reads
  this and no-ops when `href === null`, so adopters without a web font get the
  default system font with no extra work.

### `src/config/credentialTypes.js`

The list of credentials the extension knows about and how to render them.
Each entry:

| Field          | Meaning                                                                |
|----------------|------------------------------------------------------------------------|
| `key`          | Internal name. **Must match the key in the DC pipeline response JSON.**|
| `label`        | What users see.                                                        |
| `enabled`      | Hide entirely without removing the entry — useful for staging changes. |
| `ethosCode`    | Passed to the DC pipeline as the credential-type code parameter.       |
| `sides`        | Array of `'student'`, `'employee'`, `'general'` — which side(s) display this credential. |
| `composeEmail` | Optional `{ domainKey }` — when set, value is rendered as `${raw}${institution[domainKey]}` and the IdField is given `isEmail={true}` for email-styling and longer-text wrapping. |

The card renders by filtering credentialTypes on `enabled` + `sides` and
mapping to `<IdField>` — no per-credential JSX. Adding a credential is one
config edit plus a DC pipeline update.

> **Deviation from the initial plan note:** the initial plan listed
> credentialTypes with only `{ key, label, enabled, ethosCode }`. `sides` and
> `composeEmail` were added during scaffolding because (a) the card needs to
> know which side a credential belongs to, and (b) without `composeEmail` the
> email-domain fields in `institution.js` would be unused. Both additions are
> backwards-compatible additions to the spec.

### `src/config/roles.js`

How to interpret the role strings your tenant sends. Two arrays
(`student`, `employee`); comparisons are case-insensitive. Anything outside
both arrays is treated as "general" — render all available credentials with
no role-based filtering.

### `src/utils/branding/tokens.js`

Per org standard: **no hardcoded brand colors anywhere else.** A six-section
shape (primary, secondary, onPrimary, text, surface, status, focusRing) that
covers every color need in the components.

### `src/utils/fontLoader.js`

A `useTypekitFont()` hook that injects a `<link>` tag once per page, reading
`institution.typekit.href`. No-ops if `href === null`. The font-family used
by component styles comes from `institution.typekit.primaryFontFamily`.

## Why the split?

Three concerns, three places to edit:

1. **Who am I** → `institution.js` (1 file).
2. **What data shape do I work with** → `credentialTypes.js`, `roles.js` (2 files).
3. **What does it look like** → `tokens.js`, `institution.typekit` (1 file + 1 section).

Components never reach outside this surface. The card and page are pure
consumers; they don't know any institution-specific value at all. This makes
the diff for adopting the sample trivially small (one PR, five files in the
ideal case) and makes the components reusable across many institutions
without forking.

## Why CommonJS for `institution.js`?

`extension.js` (the build-time manifest) is loaded by Node directly (via
`webpack.config.js` doing `require('./extension.js')`). The cards/page
bundles are processed by Webpack (which handles ESM and CJS equally well).
A single shared config file must therefore be authored in CommonJS form
to be loadable by both worlds without a transpilation step at build-config
time. The other config files (`credentialTypes.js`, `roles.js`) are consumed
only by the React bundle and stay ESM.

## What's intentionally NOT in this extension

- **No analytics**, no user tracking. The card calls DC, displays the result,
  done.
- **No retry/backoff** on the DC call. If DC fails, the card shows an error;
  Experience platform handles refresh.
- **No caching** at the component layer. The DC pipeline declares
  `cache: false` deliberately — IDs can change (Banner renumber, email
  rename, etc.) and stale displays are confusing. Add caching only if your
  data warrants it.
- **No state management library** (Redux, Zustand, etc.). One card + one
  page worth of state is fine with `useState`.
- **No i18n** scaffolding yet. Labels are config-driven so any language is
  achievable today; `react-intl` is in the deps if you want richer
  formatting.
