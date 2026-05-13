// SPDX-License-Identifier: Apache-2.0
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@ellucian/react-design-system/core';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { institution } from '../config/institution';
import { tokens } from '../utils/branding/tokens';

const FONT_FAMILY = institution.typekit.primaryFontFamily;

const styles = () => ({
    idGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0rem',
        cursor: 'pointer',
        padding: '0rem .5rem',
        borderRadius: '6px',
        transition: 'background-color 0.15s',
        '&:hover': {
            backgroundColor: tokens.surface.subtle
        },
        '&:hover $copyIcon': {
            color: tokens.primary
        },
        '&:focus-visible': {
            outline: `3px solid ${tokens.focusRing}`,
            outlineOffset: '2px'
        }
    },
    idRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
    },
    copyIcon: {
        width: '.8rem',
        height: '.8rem',
        color: tokens.text.muted,
        transition: 'color 0.15s'
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
    label: {
        fontFamily: FONT_FAMILY,
        color: tokens.text.secondary,
        fontSize: '1rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontWeight: 600
    },
    idValue: {
        fontFamily: FONT_FAMILY,
        color: tokens.primary,
        fontSize: 'clamp(1.3rem, 7cqi, 2rem)',
        fontWeight: 700,
        letterSpacing: '0.04em'
    },
    emailValue: {
        fontFamily: FONT_FAMILY,
        color: tokens.primary,
        fontSize: 'clamp(0.85rem, 4.25cqi, 1.4rem)',
        fontWeight: 700,
        letterSpacing: '0.02em',
        wordBreak: 'break-all',
        textAlign: 'center'
    }
});

const CopyIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" focusable="false">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const CheckIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true" focusable="false">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

CopyIcon.propTypes = { className: PropTypes.string };
CheckIcon.propTypes = { className: PropTypes.string };

const IdField = ({ classes, label, value, isEmail }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(value);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }, [value]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCopy();
        }
    }, [handleCopy]);

    return (
        <div
            className={classes.idGroup}
            onClick={handleCopy}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label={`Copy ${label}: ${value}`}
        >
            <Typography className={classes.label}>{label}</Typography>
            <div className={classes.idRow}>
                <Typography className={isEmail ? classes.emailValue : classes.idValue}>
                    {value}
                </Typography>
                {copied
                    ? <CheckIcon className={classes.copyIcon} />
                    : <CopyIcon className={classes.copyIcon} />
                }
            </div>
            <span className={classes.srOnly} aria-live="polite">
                {copied ? 'Copied to clipboard' : ''}
            </span>
        </div>
    );
};

IdField.propTypes = {
    classes: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isEmail: PropTypes.bool
};

IdField.defaultProps = {
    isEmail: false
};

export default withStyles(styles)(IdField);
