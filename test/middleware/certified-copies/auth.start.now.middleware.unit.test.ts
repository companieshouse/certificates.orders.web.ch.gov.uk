import chai from "chai";
import sinon from "sinon";
import { Request, Response } from "express";
import SessionHandler from "@companieshouse/node-session-handler";
import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import authCertifiedCopyStartNowMiddleware from "../../../src/middleware/certified-copies/auth.start.now.middleware";
import { CERTIFIED_COPY_START_PAGE } from "../../utils/constants";
import { START_BUTTON_PATH_SUFFIX } from "../../../src/model/page.urls";

const sandbox = sinon.createSandbox();

const nextFunctionSpy = sandbox.spy();
const res = {} as Response;
const redirectSpy = sandbox.spy();
res.redirect = redirectSpy;

describe("certified-copies.auth.start.now.middleware.unit", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("should call next if the path is root", async () => {
        const req = { path: "/" } as Request;

        await authCertifiedCopyStartNowMiddleware(req, res, nextFunctionSpy);

        chai.expect(redirectSpy)
            .not.to.have.been.calledWith(`/signin?return_to=${CERTIFIED_COPY_START_PAGE}`);
        chai.expect(nextFunctionSpy).to.have.been.called;
    });

    it("should call next if path is not root (i.e., /start) and user is signed in", async () => {
        const req = {
            path: START_BUTTON_PATH_SUFFIX
        } as Request;
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 1
                }
            }
        );

        await authCertifiedCopyStartNowMiddleware(req, res, nextFunctionSpy);

        chai.expect(redirectSpy)
            .not.to.have.been.calledWith(`/signin?return_to=${CERTIFIED_COPY_START_PAGE}`);
        chai.expect(nextFunctionSpy).to.have.been.called;
    });

    it("should redirect from the start page to the start page if user is not signed in", async () => {
        const req = {
            path: START_BUTTON_PATH_SUFFIX,
            originalUrl: CERTIFIED_COPY_START_PAGE
        } as Request;
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 0
                }
            }
        );

        await authCertifiedCopyStartNowMiddleware(req, res, nextFunctionSpy);

        chai.expect(redirectSpy)
            .to.have.been.calledWith(`/signin?return_to=${CERTIFIED_COPY_START_PAGE}`);
        chai.expect(nextFunctionSpy).to.have.been.called;
    });

    it("should call next if user is signed in but an error occurs", async () => {
        const req = {
            path: START_BUTTON_PATH_SUFFIX,
            originalUrl: CERTIFIED_COPY_START_PAGE
        } as Request;
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 0
                }
            }
        );
        const res = {
            redirect (_url: string) {
                throw new Error("Error thrown by test code");
            }
        } as unknown as Response;

        await authCertifiedCopyStartNowMiddleware(req, res, nextFunctionSpy);

        chai.expect(redirectSpy)
            .to.have.been.calledWith(`/signin?return_to=${CERTIFIED_COPY_START_PAGE}`);
        chai.expect(nextFunctionSpy).to.have.been.called;
    });
});
