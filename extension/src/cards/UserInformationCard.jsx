// SPDX-License-Identifier: Apache-2.0
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Typography, CircularProgress } from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { Icon } from '@ellucian/ds-icons/lib';
import { useData, useCardInfo, useUserInfo } from '@ellucian/experience-extension-utils';
import { institution } from '../config/institution';
import { credentialTypes } from '../config/credentialTypes';
import { roles as roleConfig } from '../config/roles';
import { tokens } from '../utils/branding/tokens';
import { useTypekitFont } from '../utils/fontLoader';
import IdField from '../components/IdField';

const FONT_FAMILY = institution.typekit.primaryFontFamily;

const styles = () => ({
    '@keyframes flipIn': {
        '0%': { transform: 'rotateY(90deg)', opacity: 0 },
        '100%': { transform: 'rotateY(0deg)', opacity: 1 }
    },
    '@media (prefers-reduced-motion: reduce)': {
        '@global': {
            '*': {
                animationDuration: '0.01ms !important',
                transitionDuration: '0.01ms !important'
            }
        }
    },
    cardContainer: {
        containerType: 'inline-size',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0rem 1.5rem 1rem 1rem',
        gap: '0.75rem',
        maxHeight: '100%',
        overflowY: 'auto',
        scrollbarColor: 'transparent transparent',
        '&:hover': {
            scrollbarColor: `${tokens.text.muted} transparent`
        },
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'transparent',
            borderRadius: '2px'
        },
        '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: tokens.text.muted
        }
    },
    animateIn: { animation: '$flipIn 0.4s ease-out' },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '2rem'
    },
    errorContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0rem 1.5rem 1.5rem 1rem',
        height: '100%'
    },
    errorText: {
        fontFamily: FONT_FAMILY,
        color: tokens.status.error,
        fontSize: '1rem'
    },
    sideTitle: {
        fontFamily: FONT_FAMILY,
        color: tokens.secondary,
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        textDecoration: 'underline',
        textDecorationColor: tokens.primary,
        textUnderlineOffset: '0.25rem'
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        padding: '0.25rem 0.5rem',
        borderRadius: '6px',
        transition: 'background-color 0.15s',
        '&:hover': { backgroundColor: tokens.surface.subtle },
        '&:focus-visible': {
            outline: `3px solid ${tokens.focusRing}`,
            outlineOffset: '2px'
        }
    },
    srOnly: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0
    },
    flipIcon: {
        display: 'flex',
        alignItems: 'center',
        color: tokens.text.secondary,
        transition: 'color 0.15s',
        '$titleRow:hover &': { color: tokens.primary }
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

function getDefaultSide(userRoles) {
    if (hasRole(userRoles, roleConfig.student)) return 'student';
    if (hasRole(userRoles, roleConfig.employee)) return 'employee';
    return 'general';
}

function composeValueForCredential(ct, rawValue) {
    if (ct.composeEmail) {
        const domain = institution[ct.composeEmail.domainKey];
        if (domain == null) return rawValue;
        return `${rawValue}${domain}`;
    }
    return rawValue;
}

function hasDataForSide(credentials, side) {
    return credentialTypes
        .filter(ct => ct.enabled && ct.sides.includes(side))
        .some(ct => Boolean(credentials[ct.key]));
}

function buildRowsFromCredentialTypes(credentials, filterFn = () => true) {
    return credentialTypes
        .filter(ct => ct.enabled && filterFn(ct))
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

function buildRowsForSide(credentials, side) {
    return buildRowsFromCredentialTypes(credentials, ct => ct.sides.includes(side));
}

const UserInformationCard = ({ classes }) => {
    useTypekitFont();

    const { authenticatedEthosFetch } = useData();
    const { cardId, cardPrefix } = useCardInfo();
    const { roles: userRoles = [] } = useUserInfo();

    const [credentials, setCredentials] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noData, setNoData] = useState(false);
    const [animKey, setAnimKey] = useState(0);

    const defaultSide = useMemo(() => getDefaultSide(userRoles), [userRoles]);
    const [side, setSide] = useState(defaultSide);

    const toggleSide = useCallback(() => {
        setSide(prev => (prev === 'student' ? 'employee' : 'student'));
        setAnimKey(prev => prev + 1);
    }, []);

    const fetchCredentials = useCallback(async () => {
        if (!authenticatedEthosFetch || !cardId) return;

        try {
            const url = `${institution.dataConnectPipelineName}`
                + `?cardId=${encodeURIComponent(cardId)}`
                + `&cardPrefix=${encodeURIComponent(cardPrefix)}`;
            const response = await authenticatedEthosFetch(url);

            if (!response.ok) {
                console.error('UserInformationCard: Non-OK response:', response.status, response.statusText);
                setError(`Unable to retrieve IDs (status ${response.status}).`);
                return;
            }

            let data;
            try {
                data = await response.json();
            } catch (parseErr) {
                console.error('UserInformationCard: Failed to parse response JSON:', parseErr);
                setError('Unable to retrieve IDs (invalid response).');
                return;
            }

            const hasAnyValue = credentialTypes
                .filter(ct => ct.enabled)
                .some(ct => Boolean(data && data[ct.key]));

            if (!hasAnyValue) {
                setNoData(true);
                return;
            }

            setCredentials(data);
        } catch (err) {
            console.error('UserInformationCard: Error fetching credentials:', err);
            // Heuristic categorization based on substring matches. The SDK's error
            // wording is not part of a stable contract — if these strings change
            // upstream, every error falls through to the generic branch. Prefer
            // structured error fields (`err.status`, `err.name`) if/when the SDK
            // exposes them.
            if (err && err.message && (err.message.includes('401') || err.message.includes('auth'))) {
                setError('Unable to retrieve IDs (authentication error).');
            } else if (err && err.message && (err.message.includes('network') || err.message.includes('Failed to fetch'))) {
                setError('Unable to retrieve IDs (network error).');
            } else {
                // Intentionally generic — avoid leaking SDK-internal `err.message`
                // strings to end users. Full details are in console.error above.
                setError('Unable to retrieve IDs. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [authenticatedEthosFetch, cardId, cardPrefix]);

    useEffect(() => {
        fetchCredentials();
    }, [fetchCredentials]);

    // Auto-switch sides when the role-derived default has no data but
    // another side does. Prevents users from being stuck on an empty
    // side when their actual credentials live on the other side.
    useEffect(() => {
        if (!credentials || side === 'general') return;
        const sideHasDataFor = (s) => credentialTypes
            .filter(ct => ct.enabled && ct.sides.includes(s))
            .some(ct => Boolean(credentials[ct.key]));
        if (!sideHasDataFor(side)) {
            const otherSide = side === 'student' ? 'employee' : 'student';
            if (sideHasDataFor(otherSide)) {
                setSide(otherSide);
            } else if (sideHasDataFor('general')) {
                setSide('general');
            }
        }
    }, [credentials, side]);

    if (isLoading) {
        return (
            <div className={classes.loadingContainer} role="status" aria-label="Loading IDs">
                <CircularProgress aria-label="Loading" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={classes.errorContainer} role="alert">
                <Typography className={classes.errorText}>{error}</Typography>
            </div>
        );
    }

    if (noData) {
        return (
            <div className={classes.errorContainer} role="status">
                <Typography className={classes.noDataText}>
                    No IDs available for your account.
                </Typography>
            </div>
        );
    }

    const hasStudentData = hasDataForSide(credentials, 'student');
    const hasEmployeeData = hasDataForSide(credentials, 'employee');
    const canFlip = hasStudentData && hasEmployeeData;

    if (side === 'general') {
        let rows = buildRowsForSide(credentials, 'general');
        if (rows.length === 0) {
            // Adopter may have restricted some credentials away from the 'general'
            // side. Fall back to showing any available data so the user isn't
            // blocked just because their data lives on a different side.
            rows = buildRowsFromCredentialTypes(credentials);
        }
        return (
            <div className={classes.cardContainer}>
                {rows.length === 0
                    ? <Typography className={classes.noDataText}>No IDs available</Typography>
                    : rows}
            </div>
        );
    }

    const isStudent = side === 'student';
    const rows = buildRowsForSide(credentials, side);

    return (
        <div key={animKey} className={`${classes.cardContainer} ${classes.animateIn}`}>
            <div
                className={classes.titleRow}
                onClick={canFlip ? toggleSide : undefined}
                role={canFlip ? 'button' : undefined}
                tabIndex={canFlip ? 0 : undefined}
                onKeyDown={canFlip ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleSide();
                    }
                } : undefined}
                aria-label={canFlip ? (isStudent ? 'Flip to employee IDs' : 'Flip to student IDs') : undefined}
                style={canFlip ? undefined : { cursor: 'default' }}
            >
                <Typography className={classes.sideTitle}>
                    {isStudent ? 'Student' : 'Employee'}
                </Typography>
                {canFlip && (
                    <span className={classes.flipIcon} aria-hidden="true">
                        <Icon name="flip" large />
                    </span>
                )}
            </div>

            <span className={classes.srOnly} aria-live="polite">
                {animKey > 0
                    ? (isStudent ? 'Showing student IDs' : 'Showing employee IDs')
                    : ''}
            </span>

            {rows.length === 0
                ? <Typography className={classes.noDataText}>
                    No {isStudent ? 'student' : 'employee'} IDs available
                </Typography>
                : rows}
        </div>
    );
};

UserInformationCard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(UserInformationCard);
