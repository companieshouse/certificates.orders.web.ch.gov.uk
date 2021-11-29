import chai from "chai";
import sinon from "sinon";
import {NextFunction, Request, Response} from "express";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import SessionHandler from "@companieshouse/node-session-handler";
import {Session} from "@companieshouse/node-session-handler/lib/session/model/Session";

import authMiddleware from "../../src/middleware/auth.middleware";
import {CompanyProfile} from "@companieshouse/api-sdk-node/dist/services/company-profile";
import {CompanyType} from "../../src/model/CompanyType";
import {FEATURE_FLAGS} from "../../src/config/FeatureFlags";

const sandbox = sinon.createSandbox();

const nextFunctionSpy = sandbox.spy();
const res = {} as Response;
const redirectSpy = sandbox.spy();
res.redirect = redirectSpy;

describe("auth.middleware.unit", () => {
    beforeEach(() => {
        FEATURE_FLAGS.lpCertificateOrdersEnabled = true;
        FEATURE_FLAGS.llpCertificateOrdersEnabled = true;
    })
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("should call next if the path is root", async () => {
        const req = {path: "/"} as Request;
        await authMiddleware(req, res, nextFunctionSpy)
        chai.expect(nextFunctionSpy).to.have.been.called
    });

    it("should call next if path is not root and user is signed in", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 1
                }
            }
        );
        await authMiddleware(req, res, nextFunctionSpy);
        chai.expect(nextFunctionSpy).to.have.been.called;
    });

    it("should call res.redirect correctly for LTD company when is not root and user is not signed in", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 0
                }
            }
        );
        sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(
                {
                    httpStatusCode: 200,
                    resource: {
                        type: CompanyType.LIMITED_COMPANY
                    } as CompanyProfile
                }
            ));

        await authMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/certificates/certificate-type");
    });

    it("should call res.redirect correctly for LTD company when path is not root and no session", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = undefined;

        sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(
                {
                    httpStatusCode: 200,
                    resource: {
                        type: CompanyType.LIMITED_COMPANY
                    } as CompanyProfile
                }
            ));

        await authMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/certificates/certificate-type");
    });

    it("should call res.redirect correctly for LP company when is not root and user is not signed in", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 0
                }
            }
        );
        sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(
                {
                    httpStatusCode: 200,
                    resource: {
                        type: CompanyType.LIMITED_PARTNERSHIP
                    } as CompanyProfile
                }
            ));

        await authMiddleware(req, res, nextFunctionSpy);

        chai.expect(redirectSpy).to.have.been.calledWith("/signin?return_to=/company/0001/orderable/lp-certificates/certificate-type");
    });

    it("should call res.redirect correctly for LP company when path is not root and no session", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = undefined;

        sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(
                {
                    httpStatusCode: 200,
                    resource: {
                        type: CompanyType.LIMITED_PARTNERSHIP
                    } as CompanyProfile
                }
            ));

        await authMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/lp-certificates/certificate-type");
    });

    it("should call res.redirect correctly for LLP company when is not root and user is not signed in", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 0
                }
            }
        );
        sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(
                {
                    httpStatusCode: 200,
                    resource: {
                        type: CompanyType.LIMITED_LIABILITY_PARTNERSHIP
                    } as CompanyProfile
                }
            ));

        await authMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/llp-certificates/certificate-type");
    });

    it("should call res.redirect correctly for LLP company when path is not root and no session", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = undefined;

        sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(
                {
                    httpStatusCode: 200,
                    resource: {
                        type: CompanyType.LIMITED_LIABILITY_PARTNERSHIP
                    } as CompanyProfile
                }
            ));

        await authMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/llp-certificates/certificate-type");
    });

    it("should call res.redirect correctly for LLP company when path is not root and no session and LLP feature flag is false", async () => {
        FEATURE_FLAGS.llpCertificateOrdersEnabled = false;
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = undefined;

        sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(
                {
                    httpStatusCode: 200,
                    resource: {
                        type: CompanyType.LIMITED_LIABILITY_PARTNERSHIP
                    } as CompanyProfile
                }
            ));

        await authMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/certificates/certificate-type");
    });

    it("should call res.redirect correctly for LLP company when path is not root and no session and LP feature flag is false", async () => {
        FEATURE_FLAGS.lpCertificateOrdersEnabled = false;
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = undefined;

        sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(
                {
                    httpStatusCode: 200,
                    resource: {
                        type: CompanyType.LIMITED_LIABILITY_PARTNERSHIP
                    } as CompanyProfile
                }
            ));

        await authMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/certificates/certificate-type");
    });
});
