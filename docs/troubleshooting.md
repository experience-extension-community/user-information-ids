<!--
SPDX-License-Identifier: Apache-2.0
-->

# Troubleshooting

Short notes for environment-specific snags. Add to this file as new ones come up.

## Windows + AppLocker / Software Restriction Policy blocks `.cmd` shims

**Symptom.** Running `npm run lint`, `npm test`, `npm run changeset`, or
similar npm scripts on Windows produces an error like:

```
This program is blocked by group policy.
For more information, contact your system administrator.
```

The script exits non-zero before doing any real work. Each affected npm
script fails the same way.

**Why.** npm on Windows installs each bin entry as three sibling files in
`node_modules/.bin/`: a `<name>` shell script (for WSL/Cygwin), a
`<name>.cmd` (Windows batch wrapper), and a `<name>.ps1` (PowerShell
wrapper). When you run `npm run <script>`, npm invokes the `.cmd` wrapper
through `cmd.exe`. On machines with AppLocker, Software Restriction
Policy, or similar allow-list enforcement, those `.cmd` wrappers can be
denied execution while `node.exe` itself remains permitted.

**Workaround.** Call the underlying JS entry point with `node` directly,
bypassing the wrapper:

```sh
# instead of  npm run lint
node node_modules/eslint/bin/eslint.js src

# instead of  npm test
node node_modules/jest/bin/jest.js

# instead of  npx changeset
node node_modules/@changesets/cli/bin.js

# instead of  npm run build-prod
node node_modules/webpack-cli/bin/cli.js --progress --mode production --env verbose
```

Each tool's actual entry-point path can be found by:

```sh
node -e "console.log(require.resolve('<package-name>/package.json'))"
```

and reading the `bin` field of that `package.json`.

**Detection.** If you're not sure whether this policy is in play on your
machine, run `npm run lint` once. If you see the "blocked by group
policy" line, you're affected and should use the node-direct invocation
for everything below.

**CI is unaffected.** GitHub Actions runs on Ubuntu, so the workflows
in `.github/workflows/` invoke npm scripts normally. This caveat is for
local dev only.

## Anything else?

If you hit an environment-specific issue and find a workaround, add a
short section here so the next contributor doesn't re-investigate.
