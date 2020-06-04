import chai from "chai";
import sinon from "sinon";
import { Request, Response } from "express";
import SessionHandler from "ch-node-session-handler";
import { Session } from "ch-node-session-handler/lib/session/model/Session";

import authMiddleware from "../../src/middleware/auth.middleware";

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
        const req = { path: "/" } as Request;
        authMiddleware(req, res, nextFunctionSpy);
        chai.expect(nextFunctionSpy).to.have.been.called;
    });

    it("should call next if path is not root and user is signed in", () => {
        const req = {
            path: "/certificate-options",
        } as Request;
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 1,
                },
            },
        );
        authMiddleware(req, res, nextFunctionSpy);
        chai.expect(nextFunctionSpy).to.have.been.called;
    });

    it("should call res.redirect if path is not root and user is not signed in", () => {
        const req = {
            path: "/certificate-options",
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 0,
                },
            },
        );
        authMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/certificates/certificate-type");
    });

    it("should call res.redirect if path is not root and no session", () => {
        const req = {
            path: "/certificate-options",
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = undefined;
        authMiddleware(req, res, nextFunctionSpy);
        chai.expect(redirectSpy)
            .to.have.been.calledWith("/signin?return_to=/company/0001/orderable/certificates/certificate-type");
    });
});
