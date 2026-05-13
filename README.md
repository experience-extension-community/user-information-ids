<!--
SPDX-License-Identifier: Apache-2.0
-->

# user-information-ids

A parameterizable Ellucian Experience extension that displays a person's
identification credentials (Banner ID, alternative IDs, NetIDs, employee IDs)
sourced from Ethos Data Connect. Ships as a card and a full-page view, with
role-aware "student / employee / general" layouts.

This is a **community sample** — adopt it as-is by editing a handful of clearly
marked config values, or fork and extend.

> Source: derived from a working extension at an originating institution and
> generalized for the [Experience Extension Community][org].

[org]: https://github.com/experience-extension-community

## Status

🟡 **Beta** — functional reference implementation. Pending review and at least
one adopter beyond the originating institution.

## Screenshots

See `docs/images/` (placeholders pending a maintainer with a running tenant).

## Quickstart for adopters

```bash
# Fork via "Use this template" or clone directly, then:
cd extension
nvm use                # Node 20.18.1 per .nvmrc
npm install
cp sample.env .env     # fill in EXPERIENCE_EXTENSION_UPLOAD_TOKEN

# Edit the four files in extension/src/config/ and extension/src/utils/branding/tokens.js
# to match your institution. See docs/adoption-guide.md for the walkthrough.

npm run build-prod
npm run deploy-dev     # to a development Experience tenant
```

The full step-by-step adoption walkthrough is in
[`docs/adoption-guide.md`](docs/adoption-guide.md).

## What gets parameterized

Five files in `extension/src/` form the **parameterization surface** — every
institution-specific value lives here:

| File                                       | What lives there                                                                 |
|--------------------------------------------|----------------------------------------------------------------------------------|
| `src/config/institution.js`                | Publisher name, extension name, DC pipeline name, email domains, Typekit config  |
| `src/config/credentialTypes.js`            | Which credential rows to render, in what order, with what label, mapped to Ethos codes |
| `src/config/roles.js`                      | The role strings your tenant uses to distinguish students from employees         |
| `src/utils/branding/tokens.js`             | All brand colors (primary, secondary, text, surface, status, focus ring)         |
| `src/utils/fontLoader.js`                  | Reads `institution.typekit.href` — set to `null` to skip web-font injection      |

Everything else in `src/` reads from these. See
[`docs/architecture.md`](docs/architecture.md) for the data flow.

## Configuration Reference

### Environment variables (set in `extension/.env`)

| Variable                              | Required | Purpose                                                                                                  |
|---------------------------------------|----------|----------------------------------------------------------------------------------------------------------|
| `EXPERIENCE_EXTENSION_UPLOAD_TOKEN`   | Yes (for deploy) | Upload token from Experience Setup. Required for `deploy-*` / `watch-and-upload` scripts.        |
| `EXPERIENCE_EXTENSION_VERBOSE`        | No       | If truthy, webpack runs in verbose mode. The `--env verbose` script flag also enables this.              |
| `EXPERIENCE_EXTENSION_UPLOAD`         | No       | If truthy, build also uploads. The `--env upload` script flag also enables this.                         |
| `EXPERIENCE_EXTENSION_FORCE_UPLOAD`   | No       | Force re-upload of an already-existing version. The `--env forceUpload` flag also enables this.          |
| `EXPERIENCE_EXTENSION_SHARED_SECRET`  | No       | 32+ char secret used by the Setup API. Optional.                                                         |
| `EXPERIENCE_EXTENSION_ENABLED`        | No       | `true`/`false`. Sets the extension's enabled state via the Setup API on deploy.                          |
| `EXPERIENCE_EXTENSION_ENVIRONMENTS`   | No       | Comma-separated tenant list (no spaces), e.g. `Tenant1,Tenant2`. Limits where the deploy is applied.     |
| `EXPERIENCE_EXTENSION_RETURN_API_TOKEN` | No     | `true`/`false`. If `true`, prints an API token to console after upload. Requires `SHARED_SECRET`.        |
| `PORT`                                | No       | Local dev server port. Defaults to `8082`.                                                               |
| `PUBLISHER_NAME`                      | No       | Overrides `institution.publisher` at build time. Useful if the source can't be edited.                   |
| `ETHOS_API_KEY`                       | No       | Pre-fills the Ethos API Key in the extension's server-config defaults. Typically set in Experience Setup, not here. |

### Extension manifest (`extension/extension.js`)

| Field                              | Where it comes from                                  | Notes                                          |
|------------------------------------|------------------------------------------------------|------------------------------------------------|
| `name`                             | `institution.extensionName`                          | Must match `package.json` `name`.              |
| `publisher`                        | `institution.publisher` or `PUBLISHER_NAME` env var  | Shown in Experience Setup.                     |
| `configuration.server[].ethosApiKey` | Set in Experience Setup per environment            | Required — the card uses `useData()` to call DC.|

### Code-side configuration

| Knob                                          | File                                          | Adopter edits?  |
|-----------------------------------------------|-----------------------------------------------|-----------------|
| `institution.publisher`                       | `src/config/institution.js`                   | Yes             |
| `institution.extensionName`                   | `src/config/institution.js`                   | Yes — keep in sync with `package.json` name |
| `institution.dataConnectPipelineName`         | `src/config/institution.js`                   | Yes — must match the resource name in your Ethos Data Connect tenant |
| `institution.studentEmailDomain`              | `src/config/institution.js`                   | Yes (set `null` to disable composing student emails from NetIDs)     |
| `institution.employeeEmailDomain`             | `src/config/institution.js`                   | Yes (set `null` to disable composing employee emails from NetIDs)    |
| `institution.typekit.href`                    | `src/config/institution.js`                   | Optional. Set `null` to skip web-font injection. |
| `institution.typekit.linkId`                  | `src/config/institution.js`                   | Optional. DOM id of the injected `<link>`.       |
| `institution.typekit.primaryFontFamily`       | `src/config/institution.js`                   | Optional. CSS `font-family` value used everywhere. |
| `credentialTypes[].key`                       | `src/config/credentialTypes.js`               | Yes — stable internal name (matches the DC response field). |
| `credentialTypes[].label`                     | `src/config/credentialTypes.js`               | Yes — what users see.                            |
| `credentialTypes[].enabled`                   | `src/config/credentialTypes.js`               | Yes — set `false` to hide a row entirely.        |
| `credentialTypes[].ethosCode`                 | `src/config/credentialTypes.js`               | Yes — your institution's Ethos credential-type code. Passed to the DC pipeline. |
| `credentialTypes[].sides`                     | `src/config/credentialTypes.js`               | Yes — array of `'student'`, `'employee'`, `'general'` controlling which side(s) of the card display this credential. |
| `credentialTypes[].composeEmail`              | `src/config/credentialTypes.js`               | Optional. Set to `{ domainKey: 'studentEmailDomain' }` (or `'employeeEmailDomain'`) to render the value as an email by appending the matching `institution.*` domain. Omit to render the raw value. |
| `roles.student`                               | `src/config/roles.js`                         | Yes — array of role strings (case-insensitive).  |
| `roles.employee`                              | `src/config/roles.js`                         | Yes — array of role strings (case-insensitive).  |
| `tokens.primary`                              | `src/utils/branding/tokens.js`                | Yes — primary brand color.                       |
| `tokens.secondary`                            | `src/utils/branding/tokens.js`                | Yes — secondary brand / accent.                  |
| `tokens.onPrimary`                            | `src/utils/branding/tokens.js`                | Yes — foreground color on `primary` background.  |
| `tokens.text.primary` / `.secondary` / `.muted` | `src/utils/branding/tokens.js`              | Yes — text colors at three emphasis levels.      |
| `tokens.surface.base` / `.subtle` / `.elevated` | `src/utils/branding/tokens.js`              | Yes — background surface colors.                 |
| `tokens.status.error` / `.success` / `.warning` / `.info` | `src/utils/branding/tokens.js`    | Yes — semantic alert colors.                     |
| `tokens.focusRing`                            | `src/utils/branding/tokens.js`                | Yes — keyboard focus indicator color (≥3:1 vs adjacent colors). |

### Ethos Data Connect

The card calls the pipeline named by `institution.dataConnectPipelineName`.
A reference pipeline definition is in `dataconnect/`. See
[`dataconnect/README.md`](dataconnect/README.md) for the 5-step import.

## Local development

```bash
cd extension
npm install
npm run lint
npm test
npm run build-dev
npm start              # live-reload to a real Experience tenant
```

See `docs/adoption-guide.md` for the full live-reload walkthrough.

## Testing

```bash
npm test               # Jest + React Testing Library + jest-axe
```

Every component has render, behavior, and `jest-axe` accessibility coverage.

## Troubleshooting

Environment-specific snags (Windows + AppLocker `.cmd` blocking, etc.) are
collected in [`docs/troubleshooting.md`](docs/troubleshooting.md). Check there
first if an npm script fails before you've changed anything.

## Before promoting to Production

This sample's catalog status is 🟡 **Beta**. The path to 🟢 **Stable** runs
through the manual test checklist in
[`docs/manual-test-checklist.md`](docs/manual-test-checklist.md) — deploy to
a real tenant, walk the role-based card / page behavior, run a manual a11y
pass, capture screenshots. The org-level criteria (production deployment,
two-institution review, etc.) live in
[ARCHITECTURE.md § 16](https://github.com/experience-extension-community/.github/blob/main/ARCHITECTURE.md#16-promotion-to-org-checklist).

## Contributing

Read the org-level [Contributing Guide][contrib] first. PRs need:

- Conventional Commit message (`feat:`, `fix:`, `docs:`, etc.)
- DCO sign-off (`git commit -s`)
- SPDX header on every new `.js`/`.jsx` file
- Tests where appropriate; `npm test` must pass
- README's Configuration Reference table updated if a config knob changes

[contrib]: https://github.com/experience-extension-community/.github/blob/main/CONTRIBUTING.md

## License

[Apache-2.0](LICENSE). See `LICENSE` for the full text.
