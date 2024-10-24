import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import sessionHandler from "@companieshouse/node-session-handler";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { CertifiedCopyItem } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/types";

import * as apiClient from "../../../src/client/api.client";
import { CERTIFIED_COPY_CHECK_DETAILS, replaceCertifiedCopyId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { getAppWithMockedCsrf } from '../../__mocks__/csrf.mocks';
import { DISPATCH_DAYS } from "../../../src/config/config";

const CERTIFIED_COPY_ID = "CCD-123456-123456";
const ITEM_URI = "/orderable/certified-copies/CCD-123456-123456";
const CHECK_DETAILS_URL = replaceCertifiedCopyId(CERTIFIED_COPY_CHECK_DETAILS, CERTIFIED_COPY_ID);

const sandbox = sinon.createSandbox();
let testApp = null;
let getCertifiedCopyItemStub;
let getBasketStub;
let addItemToBasketStub;

describe("certified-copy.check.details.controller.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));
        testApp = getAppWithMockedCsrf(sandbox);
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("check details get", () => {
        it("renders the check details screen", async () => {
            const certifiedCopyItem = {
                companyName: "test company",
                companyNumber: "00000000",
                customerReference: "reference",
                description: "description",
                descriptionIdentifier: "description identifier",
                descriptionValues: {
                    key: "value"
                },
                etag: "etag",
                id: "CCD-123456-123456",
                itemCosts: [{
                    itemCost: "10",
                    productType: "type",
                    discountApplied: "0",
                    calculatedCost: "10"
                }],
                itemOptions: {
                    collectionLocation: "cardiff",
                    contactNumber: "0123456789",
                    deliveryMethod: "postal",
                    deliveryTimescale: "standard",
                    filingHistoryDocuments: [{
                        filingHistoryDate: "2010-02-12",
                        filingHistoryDescription: "change-person-director-company-with-change-date",
                        filingHistoryDescriptionValues: {
                            change_date: "2010-02-12",
                            officer_name: "Thomas David Wheare"
                        },
                        filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
                        filingHistoryType: "CH01",
                        filingHistoryCost: "15"
                    }],
                    forename: "forename",
                    surname: "surname"
                },
                links: {
                    self: "/path/to/certified-copy"
                },
                kind: "item#certified-copy",
                postalDelivery: true,
                postageCost: "0",
                quantity: 1,
                totalItemCost: "15"
            } as CertifiedCopyItem;

            const basketDetails = {
                deliveryDetails: {
                    forename: "bob",
                    surname: "jones",
                    addressLine1: "117 kings road",
                    addressLine2: "pontcanna",
                    country: "wales",
                    locality: "canton",
                    postalCode: "cf5 4xb",
                    region: "glamorgan"
                },
                items: [
                    {
                        totalItemCost: "15"
                    }
                ]
            } as Basket;

            getCertifiedCopyItemStub = sandbox.stub(apiClient, "getCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);
            const $ = cheerio.load(resp.text);
            chai.expect(resp.status).to.equal(200);
            chai.expect($("#companyNameValue").text().trim()).to.equal(certifiedCopyItem.companyName);
            chai.expect($("#companyNumberValue").text().trim()).to.equal(certifiedCopyItem.companyNumber);
            chai.expect($("#deliveryMethodValue").text().trim()).to.equal("Standard (aim to send out within " + DISPATCH_DAYS + " working days)");
            chai.expect($("#deliveryDetailsValue").text().trim()).to.equal("bob jones117 kings roadpontcannacantonglamorgancf5 4xbwales");
            chai.expect($("#filingHistoryDateValue1").text().trim()).to.equal("12 Feb 2010");
            chai.expect($("#filingHistoryTypeValue1").text().trim()).to.equal("CH01");
            chai.expect($("#filingHistoryDescriptionValue1").text().trim()).to.equal("Director's details changed for Thomas David Wheare on 12 February 2010");
            chai.expect($("#filingHistoryFeeValue1").text().trim()).to.equal("£15");
            chai.expect($("#totalItemCostValue").text().trim()).to.equal("£15");
        });
    });

    describe("check details post", () => {
        it("redirects the user to orders url", async () => {
            const itemUri = { itemUri: ITEM_URI } as BasketItem;
            const certifiedCopyItem = {} as CertifiedCopyItem;

            addItemToBasketStub = sandbox.stub(apiClient, "addItemToBasket")
                .returns(Promise.resolve(itemUri));
            getCertifiedCopyItemStub = sandbox.stub(apiClient, "getCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyItem));

            const resp = await chai.request(testApp)
                .post(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.contain("/basket");
        });
    });
});
