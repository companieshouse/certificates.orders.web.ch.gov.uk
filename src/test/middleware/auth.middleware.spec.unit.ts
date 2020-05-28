import { Request, Response } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { Session } from "ch-node-session-handler/lib/session/model/Session";

const mockNextFunc = jest.fn().mockResolvedValue(null);
const res = {} as Response;
const mockRedirectFunc = jest.fn().mockImplementation((page: string) => {
    return null;
});

res.redirect = mockRedirectFunc;

describe("auth.middleware", () => {
    beforeEach(() => {
        mockNextFunc.mockClear();
        mockRedirectFunc.mockClear();
    });

    it("should call next if the path is root", () => {
        const req = { path: "/" } as Request;
        authMiddleware(req, res, mockNextFunc);
        expect(mockNextFunc).toHaveBeenCalled();
    });

    it("should call next if path is not root and user is signed in", () => {
        let req = {
            path: "/certificate-options",
        } as Request;
        req.session = new Session(
            {
                signin_info: {
                    signed_in: 1,
                },
            },
        );
        authMiddleware(req, res, mockNextFunc);
        expect(mockNextFunc).toHaveBeenCalled();
    });

    it("should call res.redirect if path is not root and user is not signed in", () => {
        let req = {
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
        authMiddleware(req, res, mockNextFunc);
        expect(mockRedirectFunc)
            .toBeCalledWith("/signin?return_to=/company/0001/orderable/certificates/certificate-type");
    });

    it("should call res.redirect if path is not root and no session", () => {
        let req = {
            path: "/certificate-options",
        } as Request;
        req.params = {companyNumber: "0001"};
        req.session = undefined;
        authMiddleware(req, res, mockNextFunc);
        expect(mockRedirectFunc)
            .toBeCalledWith("/signin?return_to=/company/0001/orderable/certificates/certificate-type");
    });
});
