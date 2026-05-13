<!--
SPDX-License-Identifier: Apache-2.0
-->

# Manual Test Checklist

A walkthrough for a maintainer with Experience tenant access to run before
promoting this sample's catalog status from 🟡 **Beta** to 🟢 **Stable**
per [ARCHITECTURE.md § 16](https://github.com/experience-extension-community/.github/blob/main/ARCHITECTURE.md#16-promotion-to-org-checklist).

Estimated time: **30–45 minutes** the first time; ~15 minutes on
re-runs once your tenant config is in place.

## Prerequisites

- Configured `extension/.env` with a valid `EXPERIENCE_EXTENSION_UPLOAD_TOKEN`
  for your Experience tenant.
- The reference Ethos Data Connect pipeline imported and renamed to
  match `institution.dataConnectPipelineName`. See
  [`dataconnect/README.md`](../dataconnect/README.md).
- At least two test users available: one with a student role only, one
  with an employee/faculty role only. A dual-role user is helpful but
  not required.
- An `ethosApiKey` configured in Experience Setup for this extension's
  card.

## 1. Deploy to the tenant

```sh
cd extension
nvm use && npm install
npm run build-prod
npm run deploy-dev
```

- [ ] Deploy completes with no errors.
- [ ] Extension appears in Experience Setup at the expected version
  (matches `extension/package.json` `version`).
- [ ] Card is enabled and assigned to a dashboard you can view.

## 2. Card render — student test user

Sign in to your Experience dev tenant as a test user with only a student
role. Open the dashboard where the card is configured.

- [ ] Card loads without a long-stuck loading spinner (< 5s).
- [ ] No "Unable to retrieve IDs" error.
- [ ] No "No IDs available for your account" message (assuming the test
  user has data).
- [ ] Each enabled credential in `credentialTypes.js` whose `sides`
  array includes `'student'` and that has a value in the response
  renders a row. Credentials whose `sides` excludes `'student'` do
  **not** render on this side (verifies the `sides` filter).
- [ ] Email rows for credential types with `composeEmail` render the
  full composed email (`<netId><institution.studentEmailDomain>`), not
  just the raw NetID.
- [ ] Section title reads "Student".
- [ ] No flip-button icon appears (single-role users get a static side).

For every row, click the value:

- [ ] Toast / check-icon confirms the copy.
- [ ] Pasting elsewhere yields the exact rendered text.

## 3. Card render — employee test user

Sign out, sign in as an employee/faculty test user.

- [ ] Section title reads "Employee".
- [ ] Employee-side rows render (Banner ID, Workday ID, employee
  email, …).
- [ ] Student-only rows are NOT visible.

## 4. Card render — dual-role user (if available)

Sign in as a user with both student and employee roles.

- [ ] Section title shows the default side (student, per the
  `getDefaultSide` logic).
- [ ] The flip-icon button is visible next to the section title.
- [ ] Pressing **Enter** or **Space** on the title row flips the side.
- [ ] Clicking the title row also flips the side (mouse path).
- [ ] After flipping, content updates and the `aria-live` announcer
  reads "Showing student/employee IDs".

## 5. Page render

Click into the full-page view from the card.

- [ ] Page opens at the route configured in `extension.js`.
- [ ] Page title in the Experience chrome reads "My IDs".
- [ ] Toolbar shows a "Close" command with the close icon.
- [ ] Closing the page returns to the dashboard.
- [ ] For dual-role users, both "Student" and "Employee" `<section>`
  blocks render, each with the correct rows.
- [ ] For single-role users, the corresponding role's section renders;
  the other section appears only if the user happens to have data on
  that side.

## 6. Manual accessibility pass

### Keyboard-only

Disconnect the mouse (or commit to not using it). Starting from the
dashboard, with the card focused:

- [ ] Tab moves focus through interactive elements in a logical order.
- [ ] Shift+Tab reverses.
- [ ] Each focusable element shows a visible focus ring (3px outline,
  the `focusRing` token color).
- [ ] Enter / Space activates the flip toggle and each IdField's copy
  action.
- [ ] Opening the page view, Tab cycles through page sections and the
  toolbar's Close button.

### Screen-reader sweep

Use NVDA (Windows), VoiceOver (macOS), or your tenant's primary screen
reader. With virtual cursor / browse mode:

- [ ] Each ID row reads label + value cleanly (e.g., "Banner ID,
  B12345").
- [ ] Each copy button's accessible name is announced (e.g., "Copy
  Banner ID: B12345, button").
- [ ] After copying, the polite live region announces "Copied to
  clipboard".
- [ ] On the page, each `<section>` is announced with its heading as the
  region name ("Student region", "Employee region").
- [ ] No empty-link, missing-label, or empty-button announcements.

### Browser-extension a11y scan

Run **axe DevTools** or **WAVE** against the card and the page.

- [ ] Zero violations on the card view.
- [ ] Zero violations on the page view.
- [ ] If any "best practice" warnings appear, document them in the
  sample's README accessibility section.

## 7. Screenshot capture (for `docs/images/`)

Once the card and page render the way they should:

- [ ] `docs/images/card-preview.png` — the card on a real dashboard.
  Crop tight. Use a representative test user with multiple IDs visible.
- [ ] `docs/images/page-preview.png` — the page view with both Student
  and Employee sections populated (a dual-role test user is ideal).
- [ ] Both images use **neutral test data only** — fake IDs like
  `123456789`, fake emails like `testuser@example.edu`. **No real IDs,
  no real names, no production data.**
- [ ] PNG format; reasonable file size (under ~500 KB each).

Commit the images via a small PR.

## 8. Sign-off

When every box above is checked:

- [ ] Open the **Promotion-to-Org Checklist** in
  [ARCHITECTURE.md § 16](https://github.com/experience-extension-community/.github/blob/main/ARCHITECTURE.md#16-promotion-to-org-checklist)
  and verify the org-level criteria too (production deployment,
  two-institution review, etc.).
- [ ] Open a PR against `experience-extension-community/.github`'s
  `CATALOG.md` flipping this sample's status from 🟡 to 🟢.

## When something fails

A failing check is not necessarily a blocker — file it as an issue,
decide whether to fix-before-promotion or to ship and follow up. The
checklist is here so we surface issues, not to ship a perfect
extension on the first pass.
