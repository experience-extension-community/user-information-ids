// SPDX-License-Identifier: Apache-2.0
//
// Edit this file to adapt this sample to your institution.
// Every other file under src/ reads from here. Authored as CommonJS so
// extension.js (loaded by Node at build-config time) can require() it
// just like the React bundle (which Webpack interops automatically).

const institution = {
    // Display
    publisher: 'YourInstitution',           // shown in Experience Setup
    extensionName: 'user-information-ids',  // must match package.json `name`

    // Ethos Data Connect resource (your institution's pipeline)
    dataConnectPipelineName: 'YOURINST-experience-personsCredentials-get-ids',

    // Email assembly. Set to null to disable composing emails from username NetIDs.
    studentEmailDomain: '@yourinstitution.edu',
    employeeEmailDomain: '@yourinstitution.edu',

    // Typekit / web font. Set href to null to skip injection entirely.
    typekit: {
        href: null,                         // e.g. 'https://use.typekit.net/XXXXXXX.css'
        linkId: 'institution-font',
        primaryFontFamily: 'system-ui'      // safe default; override with your brand font
    }
};

module.exports = { institution };
