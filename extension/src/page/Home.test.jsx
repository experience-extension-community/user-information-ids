// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { axe } from 'jest-axe';
import {
    useData,
    useCardInfo,
    useUserInfo,
    usePageControl
} from '@ellucian/experience-extension-utils';
import Home from './Home';

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

let pageControlMock;

beforeEach(() => {
    jest.clearAllMocks();
    useData.mockReturnValue({ authenticatedEthosFetch: mockFetchSuccess() });
    useCardInfo.mockReturnValue({ cardId: 'card-1', cardPrefix: 'pre' });
    useUserInfo.mockReturnValue({ roles: [] });
    pageControlMock = {
        setPageTitle: jest.fn(),
        setPageToolbar: jest.fn(),
        setLoadingStatus: jest.fn(),
        setErrorMessage: jest.fn(),
        closePage: jest.fn()
    };
    usePageControl.mockReturnValue(pageControlMock);
});

describe('Home page', () => {
    it('sets the page title and toolbar on mount', async () => {
        render(<Home />);
        await waitFor(() => expect(pageControlMock.setPageTitle).toHaveBeenCalledWith('My IDs'));
        expect(pageControlMock.setPageToolbar).toHaveBeenCalled();
        const arg = pageControlMock.setPageToolbar.mock.calls[0][0];
        expect(arg.primaryCommands[0].label).toBe('Close');
        expect(arg.primaryCommands[0].icon).toBe('close');
    });

    it('renders the general "My IDs" section for users with no recognized role', async () => {
        useUserInfo.mockReturnValue({ roles: ['guest'] });
        render(<Home />);
        await waitFor(() => expect(screen.getByRole('heading', { name: /my ids/i })).toBeInTheDocument());
        expect(screen.getByText('Banner ID')).toBeInTheDocument();
        expect(screen.getByText('W67890')).toBeInTheDocument();
    });

    it('renders a Student section for student users', async () => {
        useUserInfo.mockReturnValue({ roles: ['student'] });
        render(<Home />);
        await waitFor(() => expect(screen.getByRole('heading', { name: /student/i })).toBeInTheDocument());
        const studentSection = screen.getByRole('region', { name: /student/i });
        expect(within(studentSection).getByText('B12345')).toBeInTheDocument();
    });

    it('renders an Employee section for faculty users', async () => {
        useUserInfo.mockReturnValue({ roles: ['faculty'] });
        render(<Home />);
        await waitFor(() => expect(screen.getByRole('heading', { name: /employee/i })).toBeInTheDocument());
        const employeeSection = screen.getByRole('region', { name: /employee/i });
        expect(within(employeeSection).getByText('W67890')).toBeInTheDocument();
    });

    it('renders both Student and Employee sections for dual-role users', async () => {
        useUserInfo.mockReturnValue({ roles: ['student', 'employee'] });
        render(<Home />);
        await waitFor(() => expect(screen.getByRole('heading', { name: /student/i })).toBeInTheDocument());
        expect(screen.getByRole('heading', { name: /employee/i })).toBeInTheDocument();
    });

    it('reports an error via setErrorMessage when DC returns no credentials', async () => {
        useData.mockReturnValue({ authenticatedEthosFetch: mockFetchSuccess({}) });
        useUserInfo.mockReturnValue({ roles: ['student'] });
        render(<Home />);
        await waitFor(() => expect(pageControlMock.setErrorMessage).toHaveBeenCalled());
        const arg = pageControlMock.setErrorMessage.mock.calls[0][0];
        expect(arg.headerMessage).toBe('No IDs Found');
    });

    it('has no axe violations once loaded (student role)', async () => {
        useUserInfo.mockReturnValue({ roles: ['student'] });
        const { container } = render(<Home />);
        await waitFor(() => expect(screen.getByRole('heading', { name: /student/i })).toBeInTheDocument());
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
