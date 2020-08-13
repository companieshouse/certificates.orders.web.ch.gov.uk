import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import sessionHandler from "ch-node-session-handler";
import { Basket } from "ch-sdk-node/dist/services/order/basket/types";
import { CertifiedCopyItem } from "ch-sdk-node/dist/services/order/certified-copies/types";

import * as apiClient from "../../../src/client/api.client";
import { CERTIFIED_COPY_CHECK_DETAILS, replaceCertifiedCopyId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";

const CERTIFIED_COPY_ID = "CHS00000000000000001";
const ITEM_URI = "/orderable/certified-copies/CHS00000000000000052";
const CHECK_DETAILS_URL = replaceCertifiedCopyId(CERTIFIED_COPY_CHECK_DETAILS, CERTIFIED_COPY_ID);

const sandbox = sinon.createSandbox();
let testApp = null;
let getCertifiedCopyItemStub;
let getBasketStub;

describe("certified-copy.check.details.controller.integration", () => {
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
            const certifiedCopyItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemOptions: {
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
                        filingHistoryType: "CH01"
                    }]
                }
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
                }
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
            chai.expect($("#deliveryMethodValue").text().trim()).to.equal("Standard delivery (aim to dispatch within 4 working days)");
            chai.expect($("#deliveryDetailsValue").text().trim()).to.equal("bob jones117 kings roadpontcannacantonglamorgancf5 4xbwales");
            chai.expect($("#filingHistoryDateValue1").text().trim()).to.equal("12 Feb 2010");
            chai.expect($("#filingHistoryTypeValue1").text().trim()).to.equal("CH01");
            chai.expect($("#filingHistoryDescriptionValue1").text().trim()).to.equal("Director's details changed for Thomas David Wheare on 12 February 2010");
            chai.expect($("#filingHistoryFeeValue1").text().trim()).to.equal("£15");
        });
    });
});
