import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { ROOT_MISSING_IMAGE_DELIVERY, replaceCompanyNumberAndFilingHistoryId } from "../../../src/model/page.urls";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import * as apiClient from "../../../src/client/api.client"
import { getDummyBasket } from "../../utils/basket.utils.test";
import { BASKET_ITEM_LIMIT } from "../../../src/config/config";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";

const sandbox = sinon.createSandbox();
let testApp = null;
let dummyCompanyProfile;
let getCompanyProfileStub;
let getBasketStub;

describe("missingImageDelivery.home.controller.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        dummyCompanyProfile = {
            httpStatusCode: 200,
            resource: {
                companyName: "company name",
                companyNumber: "00000000",
                companyStatus: "active",
                companyStatusDetail: "company status detail",
                dateOfCreation: "date of creation",
                jurisdiction: "jurisdiction",
                sicCodes: ["85100", "85200"],
                hasBeenLiquidated: false,
                type: "other",
                hasCharges: false,
                hasInsolvencyHistory: false,
                registeredOfficeAddress: {
                    addressLineOne: "line1",
                    addressLineTwo: "line2",
                    careOf: "careOf",
                    country: "uk",
                    locality: "locality",
                    poBox: "123",
                    postalCode: "post code",
                    premises: "premises",
                    region: "region"
                },
                accounts: {
                    nextAccounts: {
                        periodEndOn: "2019-10-10",
                        periodStartOn: "2019-01-01"
                    },
                    nextDue: "2020-05-31",
                    overdue: false
                },
                confirmationStatement: {
                    nextDue: "2020-05-31",
                    overdue: false
                },
                links: {
                }
            }
        };

        testApp = require("../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("renders the start page", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfile));
        getBasketStub = sandbox.stub(apiClient, "getBasket")
            .returns(Promise.resolve({ enrolled: true }));

        const resp = await chai.request(testApp)
            .get(ROOT_MISSING_IMAGE_DELIVERY);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Request a document");
    });

    it("renders the start page with a warning that basket full", async () => {
        sandbox.stub(ioredis.prototype, "get").resolves(signedInSession);

        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfile));
        sandbox.stub(apiClient, "getBasket")
            .resolves(getDummyBasket(true, BASKET_ITEM_LIMIT));

        const resp = await chai.request(testApp)
            .get(ROOT_MISSING_IMAGE_DELIVERY)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT})`);
        chai.expect(resp.text).to.contain(`Your basket is full`);
        chai.expect(resp.text).to.contain(
            `You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
        chai.expect(resp.text).to.contain(`To add more, you'll need to remove some items first.`);
    });

    it("displays the notification banner with the in context company name and company number", async () => {
        sandbox.stub(ioredis.prototype, "get").resolves(signedInSession);

        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfile));
        sandbox.stub(apiClient, "getBasket")
            .resolves(getDummyBasket(true, BASKET_ITEM_LIMIT -1));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumberAndFilingHistoryId(ROOT_MISSING_IMAGE_DELIVERY, "00000000", "mytxjsks"))
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT -1})`);
        chai.expect(resp.text).to.contain("This request will be for company name (00000000)");
    });
});
