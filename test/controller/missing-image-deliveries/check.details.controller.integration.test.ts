import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { MidItem } from "@companieshouse/api-sdk-node/dist/services/order/mid/types";
import { Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order/types";

import { MISSING_IMAGE_DELIVERY_CHECK_DETAILS, replaceMissingImageDeliveryId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { getAppWithMockedCsrf } from '../../__mocks__/csrf.mocks';
import * as apiClient from "../../../src/client/api.client";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";

const MISSING_IMAGE_DELIVERY_ID = "MID-869116-008636";
const ITEM_URI = "/orderable/missing-image-deliveries/MID-123456-123456";
const CHECK_DETAILS_URL = replaceMissingImageDeliveryId(MISSING_IMAGE_DELIVERY_CHECK_DETAILS, MISSING_IMAGE_DELIVERY_ID);

const sandbox = sinon.createSandbox();
let testApp: null = null;
let getMissingImageDeliveryItem;
let addItemToBasketStub;

describe("mid.check.details.controller.integration", () => {
    beforeEach((done) => {
        sandbox.reset();
        sandbox.restore();
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
            const missingImageDeliveryItem = {
                companyName: "test company",
                companyNumber: "00000000",
                customerReference: "customer reference",
                description: "description",
                descriptionIdentifier: "description identifier",
                descriptionValues: {
                    key: "value"
                },
                etag: "etag",
                id: "id",
                itemCosts: [
                    {
                        calculatedCost: "15",
                        discountApplied: "0",
                        productType: "product type",
                        itemCost: "15"
                    }
                ],
                totalItemCost: "3",
                itemOptions: {
                    filingHistoryBarcode: "barcode",
                    filingHistoryCategory: "category",
                    filingHistoryCost: "cost",
                    filingHistoryDate: "2010-02-12",
                    filingHistoryDescription: "change-person-director-company-with-change-date",
                    filingHistoryDescriptionValues: {
                        change_date: "2010-02-12",
                        officer_name: "Thomas David Wheare"
                    },
                    filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
                    filingHistoryType: "CH01"
                },
                kind: "kind",
                links: {
                    self: "links"
                },
                postageCost: "4",
                postalDelivery: false,
                quantity: 1
            } as MidItem;

            const basket: Basket = {
                enrolled: false
            }

            getMissingImageDeliveryItem = sandbox.stub(apiClient, "getMissingImageDeliveryItem")
                .returns(Promise.resolve(missingImageDeliveryItem));
            sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basket));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-heading-xl").text()).to.equal("Confirm this is the document you want to order");
            chai.expect($("#companyNameValue").text().trim()).to.equal(missingImageDeliveryItem.companyName);
            chai.expect($("#companyNumberValue").text().trim()).to.equal(missingImageDeliveryItem.companyNumber);
            chai.expect($("#filingHistoryDateValue").text().trim()).to.equal("12 Feb 2010");
            chai.expect($("#filingHistoryTypeValue").text().trim()).to.equal("CH01");
            chai.expect($("#filingHistoryDescriptionValue").text().trim()).to.equal("Director's details changed for Thomas David Wheare on 12 February 2010");
            chai.expect($("#totalCostValue").text().trim()).to.equal("£3");
        });
    });

    describe("check details post", () => {
        it("redirects the user to orders url", async () => {
            const itemUri = { itemUri: ITEM_URI } as BasketItem;
            const missingImageDeliveryItem = {} as MidItem;
            const basket: Basket = {
                enrolled: false
            }

            addItemToBasketStub = sandbox.stub(apiClient, "addItemToBasket")
                .returns(Promise.resolve(itemUri));
            getMissingImageDeliveryItem = sandbox.stub(apiClient, "getMissingImageDeliveryItem")
                .returns(Promise.resolve(missingImageDeliveryItem));
            sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basket));

            const resp = await chai.request(testApp)
                .post(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.contain("/basket");
            chai.expect(addItemToBasketStub).to.have.been.called;
        });

        it("redirects the enrolled user to basket page", async () => {
            const itemUri = { itemUri: ITEM_URI } as BasketItem;
            const missingImageDeliveryItem = {} as MidItem;
            const basket: Basket = {
                enrolled: true
            }

            addItemToBasketStub = sandbox.stub(apiClient, "appendItemToBasket")
                .returns(Promise.resolve(itemUri));
            getMissingImageDeliveryItem = sandbox.stub(apiClient, "getMissingImageDeliveryItem")
                .returns(Promise.resolve(missingImageDeliveryItem));
            sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basket));

            const resp = await chai.request(testApp)
                .post(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.contain("/basket");
            chai.expect(addItemToBasketStub).to.have.been.called;
        });
    });
});
