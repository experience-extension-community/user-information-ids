// SPDX-License-Identifier: Apache-2.0
// Test-only stand-in for @ellucian/react-design-system/core/styles.
// withStyles becomes a pass-through HOC that supplies a Proxy-based classes
// map: every access returns the key as the string value, so JSX like
// `className={classes.cardContainer}` produces `class="cardContainer"` in
// the rendered DOM — useful for occasional class-based assertions without
// actually compiling JSS.
import React from 'react';

const identityClasses = new Proxy({}, {
    get: (_, key) => (typeof key === 'string' ? key : undefined)
});

export const withStyles = () => (Component) => {
    const Wrapped = (props) =>
        React.createElement(Component, { ...props, classes: identityClasses });
    Wrapped.displayName = `withStyles(${Component.displayName || Component.name || 'Component'})`;
    return Wrapped;
};
