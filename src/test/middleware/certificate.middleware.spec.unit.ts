import { Request, Response, Application } from "express";
import certificateMiddleware from "../../middleware/certificate.middleware";
import { Session } from "ch-node-session-handler";
import { Just, Nothing } from "purify-ts";
import {postCertificateItem} from "../../client/api.client";
jest.mock("../../client/api.client");

const mockNextFunc = jest.fn().mockResolvedValue(null);
const res = {} as Response;
const mockRedirectFunc = jest.fn().mockImplementation((page: string) => {
    return null;
});

res.redirect = mockRedirectFunc;

const mockPostCertificateItem: jest.Mock = (<unknown> postCertificateItem as jest.Mock<typeof postCertificateItem>);

describe("certificate.middleware", () => {
    beforeEach(() => {
        mockNextFunc.mockClear();
        mockRedirectFunc.mockClear();
        mockPostCertificateItem.mockClear();
    });

    it("should do nothing if a certificate is already present in the session", async () => {
        const session: Session = new Session({
            extra_data: {
                "certificates.orders.web.ch.gov.uk": {
                    certificate: {
                        id: "CHS00000000000000001",
                        companyNumber: "00000000"
                    }
                }
            }
        })
        const req = {
            session: Just(session),
        } as Request;
        req.params = { companyNumber: "00000000" };
        await certificateMiddleware(req, res, mockNextFunc);

        expect(mockNextFunc).toHaveBeenCalled();
        expect(mockPostCertificateItem).not.toHaveBeenCalled()
    });

    it("should call postCertificateItem and redirect to certificate-options if there is no certificate id is stored in redis", async () => {
        mockPostCertificateItem.mockImplementation(() => Promise.resolve({id:"CHS00000000000000001", companyNumber: "00000000"}));
        const session: Session = new Session({
            signin_info: {
                access_token: {
                  access_token: "access_token",
                }
            }
        })
        let req = {
            session: Just(session),
        } as Request;
        req.params = { companyNumber: "00000000" };
        req.app = {} as Application;
        req.app.locals = {saveSession: jest.fn()};

        await certificateMiddleware(req, res, mockNextFunc);
        expect(mockPostCertificateItem).toHaveBeenCalled();
        expect(mockRedirectFunc).toBeCalledWith("/company/00000000/orderable/certificates/certificate-options");
    });

    it("should call postCertificateItem and redirect to certificate-options if the companyNumber in the request does not match the one in the session", async () => {
        mockPostCertificateItem.mockImplementation(() => Promise.resolve({id:"CHS00000000000000002", companyNumber: "11111111"}));
        const session: Session = new Session({
            signin_info: {
                access_token: {
                  access_token: "access_token",
                }
            },
            extra_data: {
                "certificates.orders.web.ch.gov.uk": {
                    certificate: {
                      id: "CHS00000000000000001",
                      companyNumber: "00000000"
                    }
                }
            }
        })
        let req = {
            session: Just(session),
        } as Request;
        req.params = { companyNumber: "11111111" };
        req.app = {} as Application;
        req.app.locals = {saveSession: jest.fn()};

        await certificateMiddleware(req, res, mockNextFunc);
        expect(mockPostCertificateItem).toHaveBeenCalled();
        expect(mockRedirectFunc).toBeCalledWith("/company/11111111/orderable/certificates/certificate-options");
    });
});
