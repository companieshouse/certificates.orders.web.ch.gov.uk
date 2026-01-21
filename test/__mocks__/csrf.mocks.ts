import sinon from 'sinon';
import proxyquire from 'proxyquire';

// Function to return the stubbed WebSecurity module
export const getAppWithMockedCsrf = (sandbox: sinon.SinonSandbox) => {
    // Ensure modules that read environment variables are reloaded so tests can change process.env per test
    try {
        const appPath = require.resolve("../../src/app");
        const configPath = require.resolve("../../src/config/config");
        [appPath, configPath].forEach((p) => {
            if (require.cache[p]) {
                delete require.cache[p];
            }
        });
    } catch (err) {
        // ignore if modules aren't resolved yet
    }

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