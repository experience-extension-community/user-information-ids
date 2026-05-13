// SPDX-License-Identifier: Apache-2.0
require('@testing-library/jest-dom');
const { toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);
