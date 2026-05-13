<!--
SPDX-License-Identifier: Apache-2.0
-->

# Adoption Guide

Step-by-step "make this yours" walkthrough. Estimated time: **30 minutes
to first successful deploy** if your Ethos Data Connect tenant already
has the credential types exposed.

## 1. Get the code

Click **Use this template** on the repo page, or clone:

```bash
git clone https://github.com/experience-extension-community/user-information-ids my-ids
cd my-ids/extension
nvm use            # 20.18.1
npm install
```

## 2. Edit `src/config/institution.js`

Open the file and set each value to yours.

```js
const institution = {
    publisher: 'My University',
    extensionName: 'user-information-ids',
    dataConnectPipelineName: 'MYUNIV-experience-personsCredentials-get-ids',
    studentEmailDomain: '@students.myuniv.edu',
    employeeEmailDomain: '@myuniv.edu',
    typekit: {
        href: null,        // or e.g. 'https://use.typekit.net/XXXXXXX.css'
        linkId: 'myuniv-font',
        primaryFontFamily: 'system-ui'
    }
};

module.exports = { institution };
```

Notes:

- `extensionName` must match the `name` in `package.json`.
- `dataConnectPipelineName` must exactly match the resource name in your
  Ethos Data Connect tenant.
- Set `studentEmailDomain` or `employeeEmailDomain` to `null` if your
  tenant doesn't store NetIDs that compose into emails — the credential
  rows for them will simply render the raw NetID.
- Leave `typekit.href` as `null` if you don't use a web font. The
  default font-family (`system-ui`) renders fine on every modern OS.

## 3. Edit `src/config/credentialTypes.js`

Look at the array. For each row:

- If your institution has this credential, set the `ethosCode` to your
  tenant's actual code.
- If your institution does NOT have this credential, set `enabled: false`.
- If you have an additional credential not listed, append a new entry.
  Decide its `sides` (which view it appears on) and whether it should be
  composed into an email.

The `key` field must match the field name in the JSON response from your
Ethos DC pipeline (see Step 5 below).

## 4. Edit `src/config/roles.js` and `src/utils/branding/tokens.js`

`roles.js` — set the `student` and `employee` arrays to the role strings
your Experience tenant actually sends. Comparison is case-insensitive.

`tokens.js` — set every color. The structure must stay the same; only the
values change. Test contrast against a background ≥ 4.5:1 for text per
WCAG 2.2 AA (text small) and ≥ 3:1 for UI elements.

## 5. Import the Data Connect pipeline

From `dataconnect/COMMUNITY-experience-personsCredentials-get-ids_v1.0.0.json`:

1. Sign in to Ethos Data Connect for your tenant.
2. Import the JSON. It will be created with the name
   `COMMUNITY-experience-personsCredentials-get-ids`.
3. **Rename** the resource to match the value you set in
   `institution.dataConnectPipelineName` (Step 2).
4. **Replace the parameter defaults** — every parameter currently has
   `<your-code-here>` as its default. Set each to your institution's actual
   credential-type code:
   - `legacyIdCode` — your "legacy" credential code (e.g., the value of your
     pre-Banner student ID type if you have one)
   - `workdayIdCode` — your Workday EMPL code (or equivalent)
   - `bannerIdType` — usually `bannerId` (matches the Ellucian Banner
     credential type)
   - `studentNetIdCode` — your student NetID code
   - `employeeNetIdCode` — your employee NetID code
5. When you configure the card in Experience Setup, add the **`ethosApiKey`**
   server-config value pointing to a valid Ethos API key.

See `dataconnect/README.md` for more.

## 6. Run locally

```bash
npm run lint
npm test
npm run build-dev
```

Then deploy and live-reload against a test tenant:

```bash
cp sample.env .env       # fill in EXPERIENCE_EXTENSION_UPLOAD_TOKEN
npm run deploy-dev       # uploads as a development build
npm start                # local server for live-reload
```

In the Experience app, open dev tools and run `enableLiveReload()` in the
console. Refresh. Your extension appears.

## 7. Configure the card in Experience Setup

- Enable your extension.
- Configure each card: set the **Ethos API Key (server)** config value.
- Drop the card on a relevant dashboard.

You should see the card render with your IDs.

## 8. Verify

- Open in a browser. Card renders with at least one ID row.
- Tab through with the keyboard — focus ring is visible and high-contrast.
- Click an ID — toast or check-icon confirms copy.
- For users in both student and employee roles, the title should be
  clickable to flip sides.
- For users in neither role, the "general" view shows all available IDs.

## Common pitfalls

- **No IDs render** — almost always means the DC pipeline name in
  `institution.js` doesn't match the resource name in Ethos Data Connect.
  Or `ethosApiKey` isn't set in the card configuration.
- **One ID renders, another doesn't** — likely an `ethosCode` mismatch in
  `credentialTypes.js`. Check what code your tenant uses for that
  credential type.
- **Email composes incorrectly** — the credentialType's
  `composeEmail.domainKey` must reference a non-`null` entry in
  `institution.js`.
- **Wrong color somewhere** — search for the hex; if it's not in
  `tokens.js`, the org standard was broken somewhere — that's a bug.
