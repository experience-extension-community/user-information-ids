// SPDX-License-Identifier: Apache-2.0
//
// Map credential types to UI labels and to the codes your Ethos tenant uses.
// Order = display order. Set enabled: false to hide a row without deleting it.
//
// Fields:
//   key          — must match the field name in the DC pipeline response JSON
//   label        — user-visible label
//   enabled      — set false to hide
//   ethosCode    — your institution's Ethos credential-type code; passed
//                  to the DC pipeline as a parameter
//   sides        — which side(s) of the card show this credential.
//                  Valid: 'student', 'employee', 'general'
//   composeEmail — optional. When set, the value is rendered as
//                  `${rawValue}${institution[domainKey]}` and the IdField
//                  is rendered as an email (longer wrap, email styling).

export const credentialTypes = [
    {
        key: 'bannerId',
        label: 'Banner ID',
        enabled: true,
        ethosCode: 'bannerId',
        sides: ['student', 'employee', 'general']
    },
    {
        key: 'workdayId',
        label: 'Workday ID',
        enabled: true,
        ethosCode: 'EMPL',
        sides: ['employee', 'general']
    },
    {
        key: 'studentNetId',
        label: 'Student Email',
        enabled: true,
        ethosCode: 'SNET',
        composeEmail: { domainKey: 'studentEmailDomain' },
        sides: ['student', 'general']
    },
    {
        key: 'employeeNetId',
        label: 'Employee Email',
        enabled: true,
        ethosCode: 'ENET',
        composeEmail: { domainKey: 'employeeEmailDomain' },
        sides: ['employee', 'general']
    },
    {
        key: 'legacyId',
        label: 'Legacy ID',
        enabled: false,
        ethosCode: 'SDNT',
        sides: ['student', 'general']
    }
];
