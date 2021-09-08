import chai from "chai";
import sinon from "sinon";
import {NextFunction, Request, Response} from "express";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import SessionHandler from "@companieshouse/node-session-handler";
import {Session} from "@companieshouse/node-session-handler/lib/session/model/Session";

import authMiddleware from "../../src/middleware/auth.middleware";
import {CompanyProfile} from "@companieshouse/api-sdk-node/dist/services/company-profile";

const sandbox = sinon.createSandbox();

const nextFunctionSpy = sandbox.spy();
const res = {} as Response;
const redirectSpy = sandbox.spy();
res.redirect = redirectSpy;

describe("auth.middleware.unit", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("should call next if the path is root", () => {
        const req = {path: "/"} as Request;
        authMiddleware(req, res, nextFunctionSpy).finally(() => {
            chai.expect(nextFunctionSpy).to.have.been.called
        });
    });

    it("should call next if path is not root and user is signed in", () => {
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
        authMiddleware(req, res, nextFunctionSpy).finally(() => {
            chai.expect(nextFunctionSpy).to.have.been.called;
        });
    });

    it("should call res.redirect if path is not root and user is not signed in", () => {
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
                        type: "ltd"
                    } as CompanyProfile
                }
            ));

        authMiddleware(req, res, nextFunctionSpy).finally(() => {
            chai.expect(redirectSpy)
                .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/certificates/certificate-type");
        })
    });

    it("should call res.redirect if path is not root and no session", () => {
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
                        type: "ltd"
                    } as CompanyProfile
                }
            ));

        authMiddleware(req, res, nextFunctionSpy).finally(() => {
            chai.expect(redirectSpy)
                .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/certificates/certificate-type");
        });
    });
});
