// SPDX-License-Identifier: Apache-2.0
// Test-only stand-in for @ellucian/experience-extension-utils.
// Each hook is a jest.fn() so tests can mockReturnValue per-case.

const defaultData = () => ({
    authenticatedEthosFetch: jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({})
    })
});

const defaultCardInfo = () => ({
    cardId: 'test-card',
    cardPrefix: 'test-prefix'
});

const defaultUserInfo = () => ({
    roles: []
});

const defaultPageControl = () => ({
    setPageTitle: jest.fn(),
    setPageToolbar: jest.fn(),
    setLoadingStatus: jest.fn(),
    setErrorMessage: jest.fn(),
    closePage: jest.fn()
});

const useData = jest.fn(defaultData);
const useCardInfo = jest.fn(defaultCardInfo);
const useUserInfo = jest.fn(defaultUserInfo);
const usePageControl = jest.fn(defaultPageControl);

module.exports = {
    useData,
    useCardInfo,
    useUserInfo,
    usePageControl,
    __defaults: {
        data: defaultData,
        cardInfo: defaultCardInfo,
        userInfo: defaultUserInfo,
        pageControl: defaultPageControl
    }
};
