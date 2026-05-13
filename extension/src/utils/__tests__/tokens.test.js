// SPDX-License-Identifier: Apache-2.0
import { tokens } from '../branding/tokens';

const HEX = /^#[0-9A-Fa-f]{6}$/;

describe('tokens', () => {
    it('exposes the expected top-level keys', () => {
        expect(Object.keys(tokens).sort()).toEqual(
            ['focusRing', 'onPrimary', 'primary', 'secondary', 'status', 'surface', 'text']
        );
    });

    it('all top-level color values are 6-digit hex', () => {
        expect(tokens.primary).toMatch(HEX);
        expect(tokens.secondary).toMatch(HEX);
        expect(tokens.onPrimary).toMatch(HEX);
        expect(tokens.focusRing).toMatch(HEX);
    });

    it('text contains primary, secondary, muted — all hex', () => {
        expect(tokens.text.primary).toMatch(HEX);
        expect(tokens.text.secondary).toMatch(HEX);
        expect(tokens.text.muted).toMatch(HEX);
    });

    it('surface contains base, subtle, elevated — all hex', () => {
        expect(tokens.surface.base).toMatch(HEX);
        expect(tokens.surface.subtle).toMatch(HEX);
        expect(tokens.surface.elevated).toMatch(HEX);
    });

    it('status contains error, success, warning, info — all hex', () => {
        expect(tokens.status.error).toMatch(HEX);
        expect(tokens.status.success).toMatch(HEX);
        expect(tokens.status.warning).toMatch(HEX);
        expect(tokens.status.info).toMatch(HEX);
    });
});
