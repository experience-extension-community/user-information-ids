// SPDX-License-Identifier: Apache-2.0
import { useEffect } from 'react';
import { institution } from '../config/institution';

export const ensureTypekitFont = () => {
    if (typeof document === 'undefined') {
        return null;
    }

    const { href, linkId } = institution.typekit;
    if (!href) {
        return null;
    }

    let linkElement = document.getElementById(linkId);
    if (linkElement) {
        if (linkElement.getAttribute('href') !== href) {
            linkElement.setAttribute('href', href);
        }
        return linkElement;
    }

    linkElement = document.createElement('link');
    linkElement.id = linkId;
    linkElement.rel = 'stylesheet';
    linkElement.href = href;
    document.head.appendChild(linkElement);

    return linkElement;
};

export const useTypekitFont = () => {
    useEffect(() => {
        ensureTypekitFont();
    }, []);
};
