// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import IdField from './IdField';

describe('IdField', () => {
    beforeEach(() => {
        Object.assign(navigator, {
            clipboard: { writeText: jest.fn().mockResolvedValue(undefined) }
        });
    });

    it('renders the label and value', () => {
        render(<IdField label="Banner ID" value="B12345" />);
        expect(screen.getByText('Banner ID')).toBeInTheDocument();
        expect(screen.getByText('B12345')).toBeInTheDocument();
    });

    it('exposes a clickable button with an accessible name', () => {
        render(<IdField label="Banner ID" value="B12345" />);
        expect(screen.getByRole('button', { name: /copy banner id: b12345/i })).toBeInTheDocument();
    });

    it('writes the value to the clipboard on click', () => {
        render(<IdField label="Banner ID" value="B12345" />);
        fireEvent.click(screen.getByRole('button'));
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('B12345');
    });

    it('writes the value to the clipboard on Enter', () => {
        render(<IdField label="Banner ID" value="B12345" />);
        fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('B12345');
    });

    it('writes the value to the clipboard on Space', () => {
        render(<IdField label="Banner ID" value="B12345" />);
        fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('B12345');
    });

    it('announces "Copied to clipboard" via the polite live region after copy', () => {
        const { container } = render(<IdField label="Banner ID" value="B12345" />);
        fireEvent.click(screen.getByRole('button'));
        // The live region holds the announcement text
        const liveRegion = container.querySelector('[aria-live="polite"]');
        expect(liveRegion).toHaveTextContent('Copied to clipboard');
    });

    it('renders correctly with isEmail=true', () => {
        render(<IdField label="Email" value="jdoe@example.edu" isEmail />);
        expect(screen.getByText('jdoe@example.edu')).toBeInTheDocument();
    });

    it('has no axe violations', async () => {
        const { container } = render(<IdField label="Banner ID" value="B12345" />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
