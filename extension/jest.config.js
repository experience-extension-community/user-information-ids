// SPDX-License-Identifier: Apache-2.0
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@ellucian/experience-extension-utils$': '<rootDir>/test/mocks/exp-utils.js',
        '^@ellucian/react-design-system/core/styles$': '<rootDir>/test/mocks/rds-styles.jsx',
        '^@ellucian/react-design-system/core$': '<rootDir>/test/mocks/rds-core.jsx',
        '^@ellucian/ds-icons/lib$': '<rootDir>/test/mocks/ds-icons.jsx'
    },
    testMatch: [
        '<rootDir>/src/**/*.test.{js,jsx}',
        '<rootDir>/src/**/__tests__/*.{js,jsx}'
    ],
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
    },
    moduleFileExtensions: ['js', 'jsx', 'json']
};
