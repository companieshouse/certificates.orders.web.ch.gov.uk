import {createRedisMock, getSignedOutCookie} from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());
import app from "../../app";
import * as request from "supertest";
import {
    CERTIFICATE_OPTIONS,
    DELIVERY_DETAILS,
    CHECK_DETAILS,
    replaceCompanyNumber
} from "../../model/page.urls";

const protectedPages = [
    CERTIFICATE_OPTIONS,
    DELIVERY_DETAILS,
    CHECK_DETAILS,
];

const COMPANY_NUMBER = "00000000";

describe("user not signed in", () => {

    it("should redirect to sign in page if not root url", async () => {

        for (const page of protectedPages) {
            const res = await request(app).post(replaceCompanyNumber(page, COMPANY_NUMBER)).set("Cookie", [getSignedOutCookie()]);
            expect(res.status).toEqual(302);
            expect(res.header.location).toContain("/signin");
        }
    });
  });
