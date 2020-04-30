import { Request, Response } from "express";
import { Just, Nothing } from "purify-ts";
import certificateAuthMiddleware from "../../middleware/certificate.auth.middleware";
import { Session } from "ch-node-session-handler/lib/session/model/Session";
import { getCertificateItem } from "../../client/api.client";
import { CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

jest.mock("../../client/api.client");

const mockNextFunc = jest.fn();
const res = {} as Response;
const mockRedirectFunc = jest.fn().mockImplementation((page: string) => {
    return null;
});
const mockGetCertificateItem: jest.Mock = (<unknown>getCertificateItem as jest.Mock<typeof getCertificateItem>);

res.redirect = mockRedirectFunc;

describe("certificate.auth.middleware", () => {
    beforeEach(() => {
        mockNextFunc.mockClear();
        mockRedirectFunc.mockClear();
        mockGetCertificateItem.mockClear();
    });

    it("should call next if user is signed in and has access to the certificate", async () => {
        let req = {
            path: "/certificate-options",
        } as Request;
        req.params = {certificateId: "0001"};
        const certificateItem = {} as CertificateItem;
        mockGetCertificateItem.mockImplementation(() => Promise.resolve(certificateItem));
        req.session = Just(new Session(
            {
                signin_info: {
                    signed_in: 1,
                    access_token: "abc"
                },
            },
        ));
        await certificateAuthMiddleware(req, res, mockNextFunc);
        expect(mockNextFunc).toHaveBeenCalled();
    });

    it("should call next if user is signed in and does not have access to the certificate", async () => {
        let req = {
            path: "/certificate-options",
        } as Request;
        req.params = {certificateId: "0001"};
        mockGetCertificateItem.mockImplementation(() => Promise.reject("Error"));
        req.session = Just(new Session(
            {
                signin_info: {
                    signed_in: 1,
                    access_token: "abc"
                },
            },
        ));
        await certificateAuthMiddleware(req, res, mockNextFunc)
        expect(mockNextFunc).toHaveBeenCalled();
        expect(mockNextFunc).toBeCalledWith("Error")
    });

    it("should call res.redirect if user is not signed in", async () => {
        let req = {
            path: "/certificate-options",
        } as Request;
        req.params = {certificateId: "0001"};
        req.session = Just(new Session(
            {
                signin_info: {
                    signed_in: 0,
                },
            },
        ));
        await certificateAuthMiddleware(req, res, mockNextFunc);
        expect(mockRedirectFunc)
            .toBeCalledWith("/signin?return_to=/orderable/certificates/0001/certificate-options");
    });

    it("should call res.redirect if there is no session", async () => {
        let req = {
            path: "/certificate-options",
        } as Request;
        req.params = {certificateId: "0001"};
        req.session = Nothing;
        await certificateAuthMiddleware(req, res, mockNextFunc);
        expect(mockRedirectFunc)
            .toBeCalledWith("/signin?return_to=/orderable/certificates/0001/certificate-options");
    });
});
