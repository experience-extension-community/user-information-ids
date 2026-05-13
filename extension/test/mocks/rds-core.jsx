// SPDX-License-Identifier: Apache-2.0
// Test-only stand-ins for @ellucian/react-design-system/core.
// Render testable DOM without pulling the real UMD bundle into jsdom.
import React from 'react';

export const Typography = ({ children, className, variant, id, ...rest }) => {
    const Tag = variant === 'h1' ? 'h1'
        : variant === 'h2' ? 'h2'
        : variant === 'h3' ? 'h3'
        : 'span';
    return React.createElement(Tag, { className, id, ...rest }, children);
};

export const CircularProgress = (props) =>
    React.createElement('span', { role: 'progressbar', ...props }, 'loading');
