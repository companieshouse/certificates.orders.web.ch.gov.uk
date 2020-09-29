import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { MISSING_IMAGE_DELIVERY_CHECK_DETAILS, replaceMissingImageDeliveryId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { MidItem } from "ch-sdk-node/dist/services/order/mid/types";
import * as apiClient from "../../../src/client/api.client";

const MISSING_IMAGE_DELIVERY_ID = "MID-869116-008636";
const CHECK_DETAILS_URL = replaceMissingImageDeliveryId(MISSING_IMAGE_DELIVERY_CHECK_DETAILS, MISSING_IMAGE_DELIVERY_ID);

const sandbox = sinon.createSandbox();
let testApp = null;
let getMissingImageDeliveryItem;

describe("check.details.controller.integration", () => {
    beforeEach((done) => {
        sandbox.reset();
        sandbox.restore();
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
            const missingImageDeliveryItem = {
                companyName: "test company",
                companyNumber: "00000000",
                customerReference: "customer reference",
                description: "description",
                descriptionIdentifier: "description identifier",
                descriptionValues: {
                    descriptionValues: "description values"
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
                        filingHistoryDate: "2010-02-12",
                        filingHistoryDescription: "change-person-director-company-with-change-date",
                        filingHistoryDescriptionValues: {
                            change_date: "2010-02-12",
                            officer_name: "Thomas David Wheare"
                        },
                        filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
                        filingHistoryType: "CH01",
                },
                kind: "kind",
                links: {
                    self: "links"
                },
                postageCost: "4",
                postalDelivery: false,
                quantity: 1,
            } as MidItem;

            getMissingImageDeliveryItem = sandbox.stub(apiClient, "getMissingImageDeliveryItem")
                .returns(Promise.resolve(missingImageDeliveryItem));
            
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
});
