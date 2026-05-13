// SPDX-License-Identifier: Apache-2.0
// Test-only stand-in for @ellucian/ds-icons/lib.
import React from 'react';

export const Icon = ({ name, large, ...rest }) =>
    React.createElement('span', { 'data-icon': name, 'data-large': large ? 'true' : undefined, ...rest });
