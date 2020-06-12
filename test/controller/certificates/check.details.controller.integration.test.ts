import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { BasketItem, Basket } from "ch-sdk-node/dist/services/order/basket/types";
import { CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

import * as apiClient from "../../../src/client/api.client";
import { CERTIFICATE_CHECK_DETAILS, replaceCertificateId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";

const CERTIFICATE_ID = "CHS00000000000000001";
const ITEM_URI = "/orderable/certificates/CHS00000000000000052";
const CHECK_DETAILS_URL = replaceCertificateId(CERTIFICATE_CHECK_DETAILS, CERTIFICATE_ID);

const sandbox = sinon.createSandbox();
let testApp = null;
let addItemToBasketStub;
let getCertificateItemStub;
let getBasketStub;

describe("check.details.controller.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        testApp = require("../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("check details get", () => {
        it("renders the check details screen", async () => {
            const certificateItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemCosts: [
                    {
                        itemCost: "15"
                    }
                ],
                itemOptions: {
                    certificateType: "cert type",
                    forename: "john",
                    includeCompanyObjectsInformation: true,
                    includeGoodStandingInformation: true,
                    surname: "smith"
                }
            } as CertificateItem;

            const basketDetails = {
                deliveryDetails: {
                    addressLine1: "117 kings road",
                    addressLine2: "pontcanna",
                    country: "wales",
                    locality: "canton",
                    postalCode: "cf5 4xb",
                    region: "glamorgan"
                }
            } as Basket;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-heading-xl").text()).to.equal("Check your order details");
            chai.expect($(".govuk-heading-m").text()).to.equal("Order details");
        });
    });

    describe("check details post", () => {
        it("redirects the user to orders url", async () => {
            const itemUri = { itemUri: ITEM_URI } as BasketItem;
            const certificateItem = {} as CertificateItem;

            addItemToBasketStub = sandbox.stub(apiClient, "addItemToBasket")
                .returns(Promise.resolve(itemUri));
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.contain("/basket");
        });
    });
});
