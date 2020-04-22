import {createRedisMock, getSignedInCookieNoExtraData} from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());

import {postCertificateItem} from "../../client/api.client";
jest.mock("../../client/api.client");

import app from "../../app";
import * as request from "supertest";
import {ORDER_DETAILS, replaceCompanyNumber} from "../../model/page.urls";

const COMPANY_NUMBER = "00000000";

const mockPostCertificateItem: jest.Mock = (<unknown> postCertificateItem as jest.Mock<typeof postCertificateItem>);

describe("certificate.middleware.integration", () => {

    it("should redirect to certificate-options if no certificate is stored in the session", async () => {
        mockPostCertificateItem.mockImplementation(() => Promise.resolve({id:"CHS00000000000000001", companyNumber: "00000000"}));
        
        const res = await request(app).post(replaceCompanyNumber(ORDER_DETAILS, COMPANY_NUMBER)).set("Cookie", [getSignedInCookieNoExtraData()]);
        expect(res.status).toEqual(302);
        expect(res.header.location).toContain("/certificate-options");
    });

});