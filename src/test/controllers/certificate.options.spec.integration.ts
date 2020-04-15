import {createRedisMock, getSignedInCookie} from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());

import {postCertificateItem} from "../../client/api.client";
jest.mock("../../client/api.client");

import app from "../../app";
import * as request from "supertest";
import {CERTIFICATE_OPTIONS} from "../../model/page.urls";

const mockPostCertificateItem: jest.Mock = (<unknown> postCertificateItem as jest.Mock<typeof postCertificateItem>);

describe("certificate options controller", () => {

    describe("certificate options get", () => {
        it("renders the certificate options page", async () => {
            const resp = await request(app)
                .get(CERTIFICATE_OPTIONS)
                .set("Cookie", [getSignedInCookie()]);

            expect(resp.status).toEqual(200);
            expect(resp.text).toContain("What information would you like to be included on the certificate?");
        });
    });

    describe("certificate options post", () => {
        it("redirects the user to the order-details page", async () => {
            mockPostCertificateItem.mockImplementation(() => undefined);
            const resp = await request(app)
                .post(CERTIFICATE_OPTIONS)
                .send({
                    "more-info": ["good-standing", "registered-office"],
                })
                .set("Cookie", [getSignedInCookie()]);

            expect(resp.status).toEqual(302);
            expect(resp.text).toContain("Found. Redirecting to order-details");
        });
    });

});
