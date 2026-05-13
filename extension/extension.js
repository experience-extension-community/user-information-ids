// SPDX-License-Identifier: Apache-2.0
require('dotenv').config();
const { institution } = require('./src/config/institution');

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
