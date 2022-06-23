import chai from "chai";
import sinon from "sinon";
import { Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";

import certifiedCopyAuthMiddleware from "../../../src/middleware/certified-copies/auth.middleware";
import * as apiClient from "../../../src/client/api.client";

const sandbox = sinon.createSandbox();

const nextFunctionSpy = sandbox.spy();
const res = {} as Response;
const redirectSpy = sandbox.spy();
res.redirect = redirectSpy;

describe("certified-copy.auth.middleware.unit", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("should call res.redirect if user is not signed in and trying to access the delivery details page", async () => {
        const req = {
            path: "/delivery-details"
        } as Request;
        req.params = { certifiedCopyId: "CCD-228916-028323" };
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 0
                }
            }
        );
        await certifiedCopyAuthMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/orderable/certified-copies/CCD-228916-028323/delivery-details");
    });

    it("should call res.redirect if there an attempt to access the delivery details page with no session", async () => {
        const req = {
            path: "/delivery-details"
        } as Request;
        req.params = { certifiedCopyId: "CCD-228916-028323" };
        req.session = undefined;
        await certifiedCopyAuthMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/orderable/certified-copies/CCD-228916-028323/delivery-details");
    });

    it("should call res.redirect if user is not signed in and trying to access the check details page", async () => {
        const req = {
            path: "/check-details"
        } as Request;
        req.params = { certifiedCopyId: "CCD-228916-028323" };
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 0
                }
            }
        );
        await certifiedCopyAuthMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/orderable/certified-copies/CCD-228916-028323/delivery-details");
    });

    it("should call res.redirect if there an attempt to access the check details page with no session", async () => {
        const req = {
            path: "/check-details"
        } as Request;
        req.params = { certifiedCopyId: "CCD-228916-028323" };
        req.session = undefined;
        await certifiedCopyAuthMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/orderable/certified-copies/CCD-228916-028323/delivery-details");
    });
});
