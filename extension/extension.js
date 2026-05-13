// SPDX-License-Identifier: Apache-2.0
require('dotenv').config();
const packageJson = require('./package.json');
const { institution } = require('./src/config/institution');

// Defensive cross-check: catches the silent footgun where an adopter
// renames one of {package.json `name`, institution.extensionName} but
// not the other. Manifest validation downstream would fail in a less
// obvious way; this fails the build immediately with a clear message.
if (institution.extensionName !== packageJson.name) {
    throw new Error(
        `Configuration mismatch: institution.extensionName ("${institution.extensionName}") ` +
        `must equal package.json name ("${packageJson.name}"). ` +
        `Edit one of them so the two match before building.`
    );
}

module.exports = {
    name: institution.extensionName,
    publisher: process.env.PUBLISHER_NAME || institution.publisher,
    configuration: {
        server: [{
            key: 'ethosApiKey',
            label: 'Ethos API Key (server)',
            type: 'password',
            require: true,
            value: process.env.ETHOS_API_KEY || ''
        }]
    },
    // Note: `title`, `displayCardType`, and `description` below are user-facing
    // labels shown in Experience Setup and the dashboard. They're not part of
    // the runtime parameterization surface in src/config/ — they're set once at
    // adoption. Edit here if your institution prefers different wording.
    cards: [{
        type: 'UserInformationCard',
        source: './src/cards/UserInformationCard.jsx',
        title: 'My IDs',
        displayCardType: 'User Information IDs',
        description: 'Displays a person\'s identification credentials from Ethos Data Connect.',
        pageRoute: {
            route: '/',
            excludeClickSelectors: ['a', 'button', '[role="button"]']
        }
    }],
    page: {
        source: './src/page/router.jsx'
    }
};
