import chai from "chai";
import sinon from "sinon";
import { Request, Response } from "express";
import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { CertificateItem } from "ch-sdk-node/dist/services//certificates/types";

import certificateAuthMiddleware from "../../../src/middleware/certificates/auth.middleware";
import * as apiClient from "../../../src/client/api.client";

const sandbox = sinon.createSandbox();

const nextFunctionSpy = sandbox.spy();
const res = {} as Response;
const redirectSpy = sandbox.spy();
res.redirect = redirectSpy;
let getCertificateItemStub;

describe("certificate.auth.middleware.unit", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("should call next if user is signed in and has access to the certificate", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = { certificateId: "0001" };
        const certificateItem = {} as CertificateItem;
        getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
            .returns(Promise.resolve(certificateItem));
        req.session = new Session(
            {
                signin_info: {
                    access_token: {
                        access_token: "/T+R3ABq5SPPbZWSeePnrDE1122FEZSAGRuhmn21aZSqm5UQt/wqixlSViQPOrWe2iFb8PeYjZzmNehMA3JCJg=="
                    },
                    signed_in: 1
                }
            });
        await certificateAuthMiddleware(req, res, nextFunctionSpy);
        chai.expect(nextFunctionSpy).to.have.been.called;
    });

    it("should call next if user is signed in and does not have access to the certificate", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = { certificateId: "0001" };
        getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem").returns(Promise.reject("Error")); // eslint-disable-line prefer-promise-reject-errors
        req.session = new Session(
            {
                signin_info: {
                    access_token: {
                        access_token: "/T+R3ABq5SPPbZWSeePnrDE1122FEZSAGRuhmn21aZSqm5UQt/wqixlSViQPOrWe2iFb8PeYjZzmNehMA3JCJg=="
                    },
                    signed_in: 1
                }
            });
        await certificateAuthMiddleware(req, res, nextFunctionSpy);
        chai.expect(nextFunctionSpy).to.have.been.calledWith("Error");
    });

    it("should call res.redirect if user is not signed in", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = { certificateId: "0001" };
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 0
                }
            }
        );
        await certificateAuthMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/orderable/certificates/0001/certificate-options");
    });

    it("should call res.redirect if there is no session", async () => {
        const req = {
            path: "/certificate-options"
        } as Request;
        req.params = { certificateId: "0001" };
        req.session = undefined;
        await certificateAuthMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/orderable/certificates/0001/certificate-options");
    });
});
