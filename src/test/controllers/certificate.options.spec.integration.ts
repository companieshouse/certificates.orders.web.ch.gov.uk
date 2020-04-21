import {createRedisMock, getSignedInCookie} from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());

import {patchCertificateItem, getCertificateItem} from "../../client/api.client";
jest.mock("../../client/api.client");

import app from "../../app";
import * as request from "supertest";
import {CertificateItem} from "ch-sdk-node/dist/services/order/item/certificate/types";
import {CERTIFICATE_OPTIONS} from "../../model/page.urls";

const mockPatchCertificateItem: jest.Mock = (<unknown> patchCertificateItem as jest.Mock<typeof patchCertificateItem>);
const mockGetCertificateItem: jest.Mock = (<unknown> getCertificateItem as jest.Mock<typeof getCertificateItem>);

describe("certificate options controller", () => {

    describe("certificate options get", () => {
        it("renders the certificate options page", async () => {
            const certificateItem = {
                itemOptions: {
                    directorDetails: {
                        includeBasicInformation: true,
                    },
                    includeCompanyObjectsInformation: true,
                    includeGoodStandingInformation: true,
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current",
                    },
                    secretaryDetails: {
                        includeBasicInformation: true,
                    }
                }
            } as CertificateItem;
            mockGetCertificateItem.mockImplementation(() => Promise.resolve(certificateItem));

            const resp = await request(app)
                .get(CERTIFICATE_OPTIONS)
                .set("Cookie", [getSignedInCookie()]);

            expect(resp.status).toEqual(200);
            // TODO make sure fields are checked
            expect(resp.text).toContain("What information would you like to be included on the certificate?");
        });
    });

    describe("certificate options post", () => {
        it("redirects the user to the order-details page", async () => {
            mockPatchCertificateItem.mockImplementation(() => undefined);
            const resp = await request(app)
                .post(CERTIFICATE_OPTIONS)
                .send({
                    moreInfo: ["goodStanding", "registeredOffice"],
                })
                .set("Cookie", [getSignedInCookie()]);

            expect(resp.status).toEqual(302);
            expect(resp.text).toContain("Found. Redirecting to order-details");
        });
    });

});
