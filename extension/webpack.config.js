// SPDX-License-Identifier: Apache-2.0
require('dotenv').config();
const packageJson = require('./package.json');
const extensionConfig = require('./extension.js');

const { webpackConfigBuilder } = require('@ellucian/experience-extension');

module.exports = async (env, options) => {
    const webpackConfig = await webpackConfigBuilder({
        extensionConfig: extensionConfig,
        extensionVersion: packageJson.version,
        mode: options.mode || 'production',
        verbose: env.verbose || process.env.EXPERIENCE_EXTENSION_VERBOSE || false,
        upload: env.upload || process.env.EXPERIENCE_EXTENSION_UPLOAD || false,
        forceUpload: env.forceUpload || process.env.EXPERIENCE_EXTENSION_FORCE_UPLOAD || false,
        uploadToken: process.env.EXPERIENCE_EXTENSION_UPLOAD_TOKEN,
        liveReload: env.liveReload || false,
        port: process.env.PORT || 8082
    });

    // The Ellucian SDK injects eslint-webpack-plugin into the build pipeline
    // with no flat-config awareness, so it fails to discover our root-level
    // eslint.config.mjs. Lint is run as a separate step (npm run lint, and the
    // CI lint job), so strip the plugin out of the build to avoid double work
    // and version-mismatch failures.
    if (Array.isArray(webpackConfig.plugins)) {
        webpackConfig.plugins = webpackConfig.plugins.filter(
            (plugin) => plugin && plugin.constructor && plugin.constructor.name !== 'ESLintWebpackPlugin'
        );
    }

    return webpackConfig;
};
