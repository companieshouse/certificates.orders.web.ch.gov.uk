import { Request, Response, NextFunction } from "express";
import { Just, Nothing } from "purify-ts";
import authMiddleware from "../../middleware/auth.middleware";
import { Session } from 'ch-node-session-handler/lib/session/model/Session';

const mockNextFunc = jest.fn().mockResolvedValue(null);
const res = {} as Response
const mockRedirectFunc = jest.fn().mockImplementation((page: string) => {
    return null;
});

res.redirect = mockRedirectFunc;

describe("auth.middleware", () => {
    beforeEach(() => {
        mockNextFunc.mockClear();
    });
    it("should call next if the path is root", () => {
        const req = { path: "/" } as Request
        authMiddleware(req, res, mockNextFunc)
        expect(mockNextFunc).toHaveBeenCalled();
    })
    it("should call next if path is not root and user is signed in", () => {
        let req = {
            path: "/order-details"
        } as Request
        req.session = Just(new Session(
            {
                signin_info: {
                    signed_in: 1
                }
            }
        ));
        authMiddleware(req, res, mockNextFunc)
        expect(mockNextFunc).toHaveBeenCalled();
    });
    it("should call res.redirect if path is not root and user is not signed in", () => {
        let req = {
            path: "/order-details",
        } as Request
        req.params = {companyNumber: "0001"}
        req.session = Just(new Session(
            {
                signin_info: {
                    signed_in: 0
                }
            }
        ));
        authMiddleware(req, res, mockNextFunc)
        expect(mockRedirectFunc).toBeCalledWith("/signin?return_to=/company/0001/orderable/certificates/order-details");
    });

    it("should call res.redirect if path is not root and no session", async () => {
        let req = {
            path: "/order-details",
        } as Request
        req.params = {companyNumber: "0001"}
        req.session = Nothing;
        authMiddleware(req, res, mockNextFunc)
        expect(mockRedirectFunc).toBeCalledWith("/signin?return_to=/company/0001/orderable/certificates/order-details");    
    });
})
