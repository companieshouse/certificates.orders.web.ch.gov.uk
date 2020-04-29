import { createRedisMock, getSignedInCookie } from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());
import { addItemToBasket, getCertificateItem } from "../../client/api.client";
jest.mock("../../client/api.client");

import app from "../../app";
import * as request from "supertest";
import { CHECK_DETAILS, replaceCertificateId } from "../../model/page.urls";
import { ItemUri } from "ch-sdk-node/dist/services/order/basket/types";
import { CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

const CERTIFICATE_ID = "CHS00000000000000001";
const ITEM_URI = "/orderable/certificates/CHS00000000000000052"
const CHECK_DETAILS_URL = replaceCertificateId(CHECK_DETAILS, CERTIFICATE_ID);

const mockAddItemToBasket: jest.Mock = (<unknown>addItemToBasket as jest.Mock<typeof addItemToBasket>);
const mockGetCertificateItem: jest.Mock = (<unknown>getCertificateItem as jest.Mock<typeof getCertificateItem>);

describe("check details", () => {
    it("renders the check details screen", async () => {
        const certificateItem = {} as CertificateItem;

        mockGetCertificateItem.mockImplementation(() => Promise.resolve(certificateItem));
        const resp = await request(app)
            .get(CHECK_DETAILS_URL)
            .set("Cookie", [getSignedInCookie()]);

        // make some assertions on the response
        expect(resp.status).toEqual(200);
    });
});

describe("check details post", () => {
    it("redirects the user to orders url", async () => {
        const itemUri = { itemUri: ITEM_URI } as ItemUri;
        const certificateItem = {} as CertificateItem;

        mockAddItemToBasket.mockImplementation(() => Promise.resolve(itemUri));
        mockGetCertificateItem.mockImplementation(() => Promise.resolve(certificateItem));

        const resp = await request(app)
            .post(CHECK_DETAILS_URL)
            .set("Cookie", [getSignedInCookie()]);

        expect(resp.status).toEqual(302);
        expect(resp.text).toContain("/basket")
    });
});

