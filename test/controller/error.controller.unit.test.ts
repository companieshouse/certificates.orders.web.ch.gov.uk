import sinon from "sinon";
import chai from "chai";
import { dataEmpty } from "../__mocks__/session.mocks";
import * as egg from '../../src/utils/page.header.utils';
import { CHS_URL } from "../../src/config/config";
import * as templatePaths from "../../src/model/template.paths";

const errorHandlers = require('../../src/controllers/error.controller').default; // Import your handler
// Extract csrfErrorHandler from the array of error handlers
const csrfErrorHandler = errorHandlers[1];


import { CsrfError } from '@companieshouse/web-security-node';

describe('csrfErrorHandler', function() {
    let req, res, next, sandbox;

    beforeEach(function() {
        sandbox = sinon.createSandbox();
        req = dataEmpty;
        res = {
            status: sandbox.stub().returnsThis(),
            render: sandbox.stub(),
        };
        next = sandbox.stub();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should pass non-CSRF errors to the next error handler', function() {
        const nonCsrfError = new Error('Non-CSRF Error');

        csrfErrorHandler(nonCsrfError, req, res, next);

        // Expect next to be called with the non-CSRF error
        chai.expect(next).to.have.been.calledOnceWith(nonCsrfError);
        chai.expect(res.status).to.not.have.been.called;
        chai.expect(res.render).to.not.have.been.called;
    });

    it('should handle CSRF errors by rendering the error page with a 403 status', function() {
        const csrfError = new CsrfError('CSRF Token Invalid');
        
        // Mock the function mapPageHeader used in your handler
        const pageHeader = { someHeaderData: 'header' };
        // const mapPageHeader = sandbox.stub().returns(pageHeader);

        sandbox.stub(egg, "mapPageHeader")
        .returns(pageHeader);

        // Inject SERVICE_URL as it's used in rendering
        const SERVICE_URL = CHS_URL;

        // Call the error handler with the csrfError
        csrfErrorHandler(csrfError, req, res, next);

        // Expect res.status to be called with 403
        chai.expect(res.status).to.have.been.calledOnceWith(403);
        
        // Expect res.render to be called with the correct template and data
        chai.expect(res.render).to.have.been.calledOnceWith(templatePaths.ERROR, {
            errorMessage: csrfError,
            ...pageHeader,
            SERVICE_URL
        });
        
        // Expect next not to have been called since we're handling the error
        chai.expect(next).to.not.have.been.called;
    });
});