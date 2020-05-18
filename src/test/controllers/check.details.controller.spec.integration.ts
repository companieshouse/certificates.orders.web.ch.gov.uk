import { createRedisMock, getSignedInCookie } from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());
import { addItemToBasket, getCertificateItem, getBasket } from "../../client/api.client";
jest.mock("../../client/api.client");

import app from "../../app";
import * as request from "supertest";
import { CHECK_DETAILS, replaceCertificateId } from "../../model/page.urls";
import { BasketItem, Basket } from "ch-sdk-node/dist/services/order/basket/types";
import { CertificateItem, ItemOptions } from "ch-sdk-node/dist/services/order/item/certificate/types";

const CERTIFICATE_ID = "CHS00000000000000001";
const ITEM_URI = "/orderable/certificates/CHS00000000000000052";
const CHECK_DETAILS_URL = replaceCertificateId(CHECK_DETAILS, CERTIFICATE_ID);

const mockAddItemToBasket: jest.Mock = (<unknown> addItemToBasket as jest.Mock<typeof addItemToBasket>);
const mockGetCertificateItem: jest.Mock = (<unknown> getCertificateItem as jest.Mock<typeof getCertificateItem>);
const mockGetBasket: jest.Mock = (<unknown> getBasket as jest.Mock<typeof getBasket>);

describe("check.details.controller", () => {

    beforeEach(() => {
        mockAddItemToBasket.mockClear();
        mockGetCertificateItem.mockClear();
        mockGetBasket.mockClear();
    });

    describe("check details get", () => {
        it("renders the check details screen", async () => {
            const certificateItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemCosts: [
                    {
                        itemCost: "15",
                    },
                ],
                itemOptions: {
                    certificateType: "cert type",
                    forename: "john",
                    includeCompanyObjectsInformation: true,
                    includeGoodStandingInformation: true,
                    surname: "smith",
                },
            } as CertificateItem;

            const basketDetails = {
                deliveryDetails: {
                    addressLine1: "117 kings road",
                    addressLine2: "pontcanna",
                    country: "wales",
                    locality: "canton",
                    postalCode: "cf5 4xb",
                    region: "glamorgan",
                },
            } as Basket;

            mockGetCertificateItem.mockImplementation(() => Promise.resolve(certificateItem));
            mockGetBasket.mockImplementation(() => Promise.resolve(basketDetails));

            const resp = await request(app)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [getSignedInCookie()]);

            // make some assertions on the response

            expect(resp.status).toEqual(200);
        });
    });

    describe("check details post", () => {
        it("redirects the user to orders url", async () => {
            const itemUri = { itemUri: ITEM_URI } as BasketItem;
            const certificateItem = {} as CertificateItem;

            mockAddItemToBasket.mockImplementation(() => Promise.resolve(itemUri));
            mockGetCertificateItem.mockImplementation(() => Promise.resolve(certificateItem));

            const resp = await request(app)
                .post(CHECK_DETAILS_URL)
                .set("Cookie", [getSignedInCookie()]);

            expect(resp.status).toEqual(302);
            expect(resp.text).toContain("/basket");
        });
    });
});
