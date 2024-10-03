import sinon from 'sinon';
import proxyquire from 'proxyquire';

// Function to return the stubbed WebSecurity module
export const getAppWithMockedCsrf = (sandbox: sinon.SinonSandbox) => {
    // Stub the CsrfProtectionMiddleware
    const stubbedWebSecurity = {
        CsrfProtectionMiddleware: sandbox.stub().callsFake((csrfOptions) => {
            // Return a no-op middleware
            return (req, res, next) => {
                console.log('No-op CSRF middleware executed');
                next();
            };
        })
    };

    // Return the app with the stubbed WebSecurity module using proxyquire
    const app = proxyquire("../../src/app", {
        "@companieshouse/web-security-node": stubbedWebSecurity
    }).default;

    return app;
};