<!--
SPDX-License-Identifier: Apache-2.0
-->

# docs/images/

This folder will hold screenshots referenced from the project README and the
adoption guide:

- `card-preview.png` — the rendered card in a real Experience dashboard,
  showing a representative set of IDs.
- `page-preview.png` — the full-page view (opened via "View More" from the
  card), showing both Student and Employee sections for a dual-role user.

**These haven't been added yet** because they require a running deployment of
the extension against a real Experience tenant with realistic data. A
maintainer with that access should:

1. Configure the extension in their dev tenant.
2. Sign in as a representative test user (one student-only and one
   dual-role user).
3. Capture screenshots with neutral test data only — no real IDs, no real
   names. Use sample like `123456789` for IDs, `testuser@example.edu` for
   emails.
4. Crop tight, save as PNG, drop here.
5. Update the README image references if filenames differ.

Until then, links from the README/adoption-guide that point to these images
will 404 — preferable to inventing fake placeholders.
