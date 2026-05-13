// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { useData, useCardInfo, useUserInfo } from '@ellucian/experience-extension-utils';
import UserInformationCard from './UserInformationCard';
import { institution } from '../config/institution';

const sampleCredentials = {
    bannerId: 'B12345',
    workdayId: 'W67890',
    studentNetId: 'jdoe',
    employeeNetId: 'jdoe-staff'
};

function mockFetchSuccess(data = sampleCredentials) {
    return jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => data
    });
}

function mockFetchFailure(status = 500) {
    return jest.fn().mockResolvedValue({
        ok: false,
        status,
        statusText: 'Server Error',
        json: async () => ({})
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    useData.mockReturnValue({ authenticatedEthosFetch: mockFetchSuccess() });
    useCardInfo.mockReturnValue({ cardId: 'card-1', cardPrefix: 'pre' });
    useUserInfo.mockReturnValue({ roles: [] });
});

describe('UserInformationCard', () => {
    it('renders the loading state initially', () => {
        useData.mockReturnValue({
            authenticatedEthosFetch: jest.fn(() => new Promise(() => { /* never resolves */ }))
        });
        render(<UserInformationCard />);
        expect(screen.getByRole('status', { name: /loading ids/i })).toBeInTheDocument();
    });

    it('renders student credentials when user has the student role', async () => {
        useUserInfo.mockReturnValue({ roles: ['student'] });
        render(<UserInformationCard />);
        await waitFor(() => expect(screen.getByText('Banner ID')).toBeInTheDocument());
        expect(screen.getByText('B12345')).toBeInTheDocument();
        const expectedEmail = `jdoe${institution.studentEmailDomain}`;
        expect(screen.getByText(expectedEmail)).toBeInTheDocument();
        // Employee-side credentials not visible on student side
        expect(screen.queryByText('W67890')).not.toBeInTheDocument();
    });

    it('renders employee credentials when user has only the employee role', async () => {
        useUserInfo.mockReturnValue({ roles: ['faculty'] });
        render(<UserInformationCard />);
        await waitFor(() => expect(screen.getByText('Banner ID')).toBeInTheDocument());
        expect(screen.getByText('W67890')).toBeInTheDocument();
        const expectedEmail = `jdoe-staff${institution.employeeEmailDomain}`;
        expect(screen.getByText(expectedEmail)).toBeInTheDocument();
    });

    it('shows a flip button for dual-role users', async () => {
        useUserInfo.mockReturnValue({ roles: ['student', 'employee'] });
        render(<UserInformationCard />);
        await waitFor(() =>
            expect(screen.getByRole('button', { name: /flip to employee ids/i })).toBeInTheDocument()
        );
    });

    it('shows the general view (all credentials) for users with no recognized role', async () => {
        useUserInfo.mockReturnValue({ roles: ['guest'] });
        render(<UserInformationCard />);
        await waitFor(() => expect(screen.getByText('Banner ID')).toBeInTheDocument());
        expect(screen.getByText('W67890')).toBeInTheDocument();
        expect(screen.getByText('B12345')).toBeInTheDocument();
        // Title row is not rendered in general view
        expect(screen.queryByText('Student')).not.toBeInTheDocument();
        expect(screen.queryByText('Employee')).not.toBeInTheDocument();
    });

    it('renders an error when the DC fetch returns a non-OK response', async () => {
        useData.mockReturnValue({ authenticatedEthosFetch: mockFetchFailure(500) });
        render(<UserInformationCard />);
        await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
        expect(screen.getByText(/Unable to retrieve IDs/i)).toBeInTheDocument();
    });

    it('renders a polite "no data" status (not an alert) when DC returns an empty object', async () => {
        useData.mockReturnValue({ authenticatedEthosFetch: mockFetchSuccess({}) });
        render(<UserInformationCard />);
        await waitFor(() => expect(screen.getByText(/No IDs available/i)).toBeInTheDocument());
        // Empty data is a valid response, not an error — should not interrupt screen-reader users.
        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('has no axe violations once loaded (student role)', async () => {
        useUserInfo.mockReturnValue({ roles: ['student'] });
        const { container } = render(<UserInformationCard />);
        await waitFor(() => expect(screen.getByText('Banner ID')).toBeInTheDocument());
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
