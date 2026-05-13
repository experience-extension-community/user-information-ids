// SPDX-License-Identifier: Apache-2.0
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import {
    useData,
    useCardInfo,
    useUserInfo,
    usePageControl
} from '@ellucian/experience-extension-utils';
import { institution } from '../config/institution';
import { credentialTypes } from '../config/credentialTypes';
import { roles as roleConfig } from '../config/roles';
import { tokens } from '../utils/branding/tokens';
import { useTypekitFont } from '../utils/fontLoader';
import IdField from '../components/IdField';

const FONT_FAMILY = institution.typekit.primaryFontFamily;

const styles = () => ({
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        gap: '2rem',
        maxWidth: '600px',
        margin: '0 auto'
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
        padding: '1.5rem 1rem',
        borderRadius: '8px',
        border: `1px solid ${tokens.text.muted}`,
        backgroundColor: tokens.surface.elevated
    },
    sectionTitle: {
        fontFamily: FONT_FAMILY,
        color: tokens.secondary,
        fontSize: '1.75rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textDecoration: 'underline',
        textDecorationColor: tokens.primary,
        textUnderlineOffset: '0.25rem'
    },
    noDataText: {
        fontFamily: FONT_FAMILY,
        color: tokens.text.secondary,
        fontSize: '0.9rem',
        fontStyle: 'italic'
    }
});

function hasRole(userRoles, roleStrings) {
    return userRoles.some(r => roleStrings.includes(r.toLowerCase()));
}

function composeValueForCredential(ct, rawValue) {
    if (ct.composeEmail) {
        const domain = institution[ct.composeEmail.domainKey];
        if (domain == null) return rawValue;
        return `${rawValue}${domain}`;
    }
    return rawValue;
}

function buildRowsForSide(credentials, side) {
    return credentialTypes
        .filter(ct => ct.enabled && ct.sides.includes(side))
        .map(ct => {
            const rawValue = credentials[ct.key];
            if (!rawValue) return null;
            const isEmail = Boolean(ct.composeEmail);
            const displayValue = composeValueForCredential(ct, rawValue);
            return (
                <IdField
                    key={ct.key}
                    label={ct.label}
                    value={displayValue}
                    isEmail={isEmail}
                />
            );
        })
        .filter(Boolean);
}

function hasDataForSide(credentials, side) {
    return credentialTypes
        .filter(ct => ct.enabled && ct.sides.includes(side))
        .some(ct => Boolean(credentials[ct.key]));
}

const HomePage = ({ classes }) => {
    const {
        setPageTitle,
        setPageToolbar,
        setLoadingStatus,
        setErrorMessage,
        closePage
    } = usePageControl();
    useTypekitFont();

    const { authenticatedEthosFetch } = useData();
    const { cardId, cardPrefix } = useCardInfo();
    const { roles: userRoles = [] } = useUserInfo();

    const [credentials, setCredentials] = useState(null);

    const isStudent = useMemo(() => hasRole(userRoles, roleConfig.student), [userRoles]);
    const isEmployee = useMemo(() => hasRole(userRoles, roleConfig.employee), [userRoles]);
    const isGeneral = !isStudent && !isEmployee;

    useEffect(() => {
        setPageTitle('My IDs');
        setPageToolbar({
            primaryCommands: [{
                label: 'Close',
                icon: 'close',
                callback: () => closePage()
            }]
        });
    }, [setPageTitle, setPageToolbar, closePage]);

    const fetchCredentials = useCallback(async () => {
        if (!authenticatedEthosFetch || !cardId) return;
        setLoadingStatus(true);
        try {
            const response = await authenticatedEthosFetch(
                `${institution.dataConnectPipelineName}?cardId=${cardId}&cardPrefix=${cardPrefix}`
            );

            if (!response.ok) {
                console.error('HomePage: Non-OK response:', response.status, response.statusText);
                setErrorMessage({
                    headerMessage: 'Error',
                    textMessage: `Unable to retrieve your IDs (status ${response.status}).`,
                    iconName: 'error',
                    iconColor: tokens.status.error
                });
                return;
            }

            let data;
            try {
                data = await response.json();
            } catch (parseErr) {
                console.error('HomePage: Failed to parse response JSON:', parseErr);
                setErrorMessage({
                    headerMessage: 'Error',
                    textMessage: 'Unable to retrieve your IDs (invalid response).',
                    iconName: 'error',
                    iconColor: tokens.status.error
                });
                return;
            }

            const hasAnyValue = credentialTypes
                .filter(ct => ct.enabled)
                .some(ct => Boolean(data && data[ct.key]));

            if (!hasAnyValue) {
                setErrorMessage({
                    headerMessage: 'No IDs Found',
                    textMessage: 'No identification data is available for your account.',
                    iconName: 'warning',
                    iconColor: tokens.status.warning
                });
                return;
            }

            setCredentials(data);
        } catch (err) {
            console.error('HomePage: Error fetching credentials:', err);
            setErrorMessage({
                headerMessage: 'Error',
                textMessage: 'Unable to retrieve your IDs. Please try again later.',
                iconName: 'error',
                iconColor: tokens.status.error
            });
        } finally {
            setLoadingStatus(false);
        }
    }, [authenticatedEthosFetch, cardId, cardPrefix, setLoadingStatus, setErrorMessage]);

    useEffect(() => {
        fetchCredentials();
    }, [fetchCredentials]);

    if (!credentials) {
        return null;
    }

    if (isGeneral) {
        const rows = buildRowsForSide(credentials, 'general');
        return (
            <div className={classes.pageContainer}>
                <section className={classes.section} aria-labelledby="general-ids-heading">
                    <Typography variant="h2" id="general-ids-heading" className={classes.sectionTitle}>
                        My IDs
                    </Typography>
                    {rows.length === 0
                        ? <Typography className={classes.noDataText}>No IDs available</Typography>
                        : rows}
                </section>
            </div>
        );
    }

    const showStudent = isStudent || hasDataForSide(credentials, 'student');
    const showEmployee = isEmployee || hasDataForSide(credentials, 'employee');

    return (
        <div className={classes.pageContainer}>
            {showStudent && (
                <section className={classes.section} aria-labelledby="student-ids-heading">
                    <Typography variant="h2" id="student-ids-heading" className={classes.sectionTitle}>
                        Student
                    </Typography>
                    {(() => {
                        const rows = buildRowsForSide(credentials, 'student');
                        return rows.length === 0
                            ? <Typography className={classes.noDataText}>No student IDs available</Typography>
                            : rows;
                    })()}
                </section>
            )}

            {showEmployee && (
                <section className={classes.section} aria-labelledby="employee-ids-heading">
                    <Typography variant="h2" id="employee-ids-heading" className={classes.sectionTitle}>
                        Employee
                    </Typography>
                    {(() => {
                        const rows = buildRowsForSide(credentials, 'employee');
                        return rows.length === 0
                            ? <Typography className={classes.noDataText}>No employee IDs available</Typography>
                            : rows;
                    })()}
                </section>
            )}
        </div>
    );
};

HomePage.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomePage);
