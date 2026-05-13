<!--
SPDX-License-Identifier: Apache-2.0
-->

# Known Issues — Dependency Vulnerabilities

This document tracks the `npm audit` findings for the extension's
dependency tree, the action taken (or not taken) for each, and the
reason. It exists so contributors don't re-investigate the same
findings each cycle.

**Last audit:** 2026-05-13 (Node 24.15.0, npm 11.12.1)
**Total findings:** 16 (5 low, 7 moderate, 2 high, 2 critical)
**Findings fixed automatically (`npm audit fix`):** 0

## Summary

Every finding falls into one of three buckets:

1. **Nested inside `@ellucian/*` pinned tarballs.** The Ellucian SDK
   ships as fully-resolved `.tgz` files at fixed CDN URLs
   (`https://cdn.elluciancloud.com/assets/SDK/...`). These tarballs
   bundle their own `node_modules/` with specific transitive versions
   that npm cannot safely override at install time. Fixing these
   requires the Ellucian SDK team to publish updated tarballs.
2. **Breaking-change bump required on a direct dep.** Two direct
   devDependencies (`jest-environment-jsdom`, `webpack-dev-server`)
   have fixes available only in a major version that would require
   verifying compatibility with React 17 and the existing test setup.
   Deferred until a coordinated update.
3. **No upstream fix exists.** A small number have no fixed release
   anywhere — only an advisory.

## Findings (16)

### (a) Direct dependencies we control

| Package | Severity | Fix path | Status |
|---|---|---|---|
| `jest-environment-jsdom@29.x` | low | Major bump to `30.x` | **Deferred.** Bumping to v30 also bumps `jsdom`, `http-proxy-agent`, and `@tootallnate/once`. Compatibility with `@testing-library/react@12.x` (React 17) needs verification first. Re-evaluate when we bump to React 18. |
| `webpack-dev-server@4.x` | moderate | Major bump to `5.x` | **Deferred.** v5 changed config API; the Ellucian SDK's `webpackConfigBuilder` returns config tuned for v4. Bumping risks breaking `npm start` / live-reload until the SDK is updated or our `webpack.config.js` post-processes the v4 config into a v5 shape. |

### (b) Transitive via `@ellucian/experience-extension` (build/upload tooling)

| Package | Severity | Advisory summary | Status |
|---|---|---|---|
| `axios` | high | SSRF + credential leakage via absolute URL; DoS via missing size check; `NO_PROXY` bypass | **Deferred.** Lives inside the SDK's pinned tarball; used at upload time, not bundled into the deployed extension. |
| `form-data` | critical | Unsafe randomness when choosing multipart boundary | **Deferred.** Same nesting — used by the SDK's upload path. |
| `lodash` | high | Prototype pollution in `_.unset` / `_.omit`; code injection via `_.template`; further prototype-pollution paths | **Deferred.** Used by the SDK build pipeline. |
| `webpack` | low | `buildHttp` allowedUris bypass via URL userinfo / redirects → SSRF | **Deferred.** Internal webpack inside the SDK tarball. |
| `@babel/runtime-corejs2` | moderate | Inefficient RegExp complexity in transpiled `.replace` paths | **Deferred.** Bundled inside the SDK tarball. |
| `@babel/runtime` | moderate | Same RegExp issue | **Deferred.** No upstream fix at the version the SDK uses; would need an SDK bump. |

### (c) Transitive via `@ellucian/react-design-system` (UI components)

| Package | Severity | Advisory summary | Status |
|---|---|---|---|
| `lodash` | high | (same as above; reached again via RDS) | **Deferred.** Same root cause. |
| `postcss` | moderate | XSS via unescaped `</style>` in CSS stringify output | **Deferred.** RDS build-time only. |
| `quill` | moderate | Cross-site scripting | **Deferred.** `react-quill` is bundled by RDS but not imported by this extension's code. Risk is theoretical for this sample. |
| `react-quill` | moderate | Depends on vulnerable `quill` | **Deferred.** Same reasoning. |

### (d) Transitive via `jest-environment-jsdom@29` (dev/test only)

| Package | Severity | Advisory summary | Status |
|---|---|---|---|
| `jsdom` | low | Vulnerable transitive chain | **Deferred.** Resolved when (a) above is bumped. |
| `http-proxy-agent` | low | Vulnerable transitive (`@tootallnate/once`) | **Deferred.** Resolved when (a) above is bumped. |
| `@tootallnate/once` | low | Incorrect control flow scoping | **Deferred.** Resolved when (a) above is bumped. |

## Why nothing was auto-fixed

- `npm audit fix` (no `--force`) was run on 2026-05-13; it reported all
  16 findings as "available via npm audit fix" but applied **zero**
  changes. The reason: every suggested fix targets a version nested
  inside `@ellucian/*`'s own `node_modules/` (delivered as a frozen
  tarball), which npm cannot rewrite without forking the tarball.
- `npm audit fix --force` was **not** run. It would have bumped two
  direct deps with breaking changes, both of which need a coordinated
  compatibility verification (see deferred status above).
- `package.json` `overrides` were considered as a way to force newer
  transitive versions inside the SDK trees. Rejected for now because:
  (a) the SDK might rely on specific lodash / axios API shapes that
  differ between versions, and (b) the affected code paths are
  SDK-internal (build/upload), not user-facing extension code.

## Path forward

Re-run `npm audit` every quarter, or whenever a new
`@ellucian/experience-extension` / `@ellucian/react-design-system`
tarball is published. When a finding's fix path no longer reads
"deferred", open a focused PR to apply it.

A future PR worth considering:

- Bump `jest-environment-jsdom` 29 → 30 alongside the React 17 → 18
  upgrade. Clears (a)-jest-environment-jsdom and the entire (d) group
  in one move.
- Bump `webpack-dev-server` 4 → 5 once the SDK's `webpackConfigBuilder`
  produces v5-compatible config, **or** add a post-process step in
  `webpack.config.js` that adapts the v4 config shape.

## Risk assessment for adopters

These findings exist in **dev / build / upload** dependency chains, not
in the runtime code that ships in the extension bundle to Experience
users. An adopter who builds this extension and deploys to their tenant
is not exposing end users to these vulnerabilities. The risk surface is
contributor machines and CI runners — material, but bounded.

If your institution's security review requires a clean `npm audit`
before any contribution, treat the findings here as acknowledged-and-
mitigated rather than open. Cite this document.
