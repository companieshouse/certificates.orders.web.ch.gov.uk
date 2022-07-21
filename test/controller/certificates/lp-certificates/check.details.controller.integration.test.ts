import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order/types";

import * as apiClient from "../../../../src/client/api.client";
import { LP_CERTIFICATE_CHECK_DETAILS, replaceCertificateId } from "../../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../../__mocks__/redis.mocks";
import { mockBasketDetails, mockDissolvedCertificateItem } from "../../../__mocks__/certificates.mocks";
const chai = require("chai");

const CERTIFICATE_ID = "CHS00000000000000001";
const ITEM_URI = "/orderable/llp-certificates/CHS00000000000000052";
const CHECK_DETAILS_URL = replaceCertificateId(LP_CERTIFICATE_CHECK_DETAILS, CERTIFICATE_ID);

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

const sandbox = sinon.createSandbox();
let testApp = null;
let addItemToBasketStub;
let getCertificateItemStub;
let getBasketStub;

describe("LP certificate.check.details.controller.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        testApp = require("../../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("LP check details get", () => {
        it("renders the check details screen", async () => {
            const certificateItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemCosts: [{
                    itemCost: "15"
                }],
                itemOptions: {
                    certificateType: "cert type",
                    forename: "john",
                    surname: "smith",
                    deliveryTimescale: "standard",
                    includeEmailCopy: false
                }
            } as CertificateItem;

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
            chai.expect($("#orderDetails").text()).to.equal("Order details");
            chai.expect($(".govuk-summary-list__row:nth-of-type(2)").find(".govuk-summary-list__key").text().trim()).to.include("Email copy required");
            chai.expect($(".govuk-summary-list__row:nth-of-type(2)").find(".govuk-summary-list__value").text().trim()).to.include("Email only available for express delivery method");
        });

        it("Renders alternate check details template if user is enrolled", async () => {
            const certificateItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemCosts: [{
                    itemCost: "15"
                }],
                itemOptions: {
                    certificateType: "cert type",
                    forename: "john",
                    surname: "smith",
                    deliveryTimescale: "standard",
                    includeEmailCopy: false
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ ...basketDetails, enrolled: true }));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-heading-xl").text()).to.equal("Check your certificate");
            chai.expect($("#cert-options-heading").text()).to.equal("Certificate options");
            chai.expect($(".govuk-summary-list__row:nth-of-type(4)").find(".govuk-summary-list__key").text().trim()).to.include("Statement of good standing");
            chai.expect($(".govuk-summary-list__row:nth-of-type(9)").find(".govuk-summary-list__key").text().trim()).to.include("Delivery method");
            chai.expect($(".govuk-summary-list__row:nth-of-type(10)").find(".govuk-summary-list__key").text().trim()).to.include("Email copy required");
        });
    });

    describe("check value returns yes or no for certificate item options", () => {
        it("returns a yes or no value if selected on certificate item options", async () => {
            const certificateItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemCosts: [{
                    itemCost: "15"
                }],
                itemOptions: {
                    certificateType: "cert type",
                    forename: "john",
                    surname: "smith",
                    includeGoodStandingInformation: true,
                    generalPartnerDetails: {
                        includeBasicInformation: true
                    },
                    limitedPartnerDetails: {
                        includeBasicInformation: true
                    },
                    includeGeneralNatureOfBusinessInformation: true
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".statementOfGoodStanding").text().trim()).to.equal("Yes");
            chai.expect($(".generalPartners").text().trim()).to.equal("Yes");
            chai.expect($(".limitedPartners").text().trim()).to.equal("Yes");
            chai.expect($(".generalNatureOfBusiness").text().trim()).to.equal("Yes");
        });
    });

    describe("check correct value is shown for principal place of business field", () => {
        it("returns the mapped value for principal place of business", async () => {
            const certificateItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemCosts: [{
                    itemCost: "15"
                }],
                itemOptions: {
                    certificateType: "cert type",
                    forename: "john",
                    surname: "smith",
                    principalPlaceOfBusinessDetails: {
                        includeAddressRecordsType: "all"
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".principalPlaceOfBusiness").text().trim()).to.equal("All current and previous addresses");
        });
    });

    describe("check details for dissolved company", () => {
        it("renders the check details get screen", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(mockDissolvedCertificateItem));

            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(mockBasketDetails));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).not.to.contain("Included on certificate");
            chai.expect(resp.text).to.contain("Dissolution with all company name changes");
        });
    });

    describe("check details post", () => {
        it("adds item to basket and redirects the user to orders url if user disenrolled", async () => {
            const itemUri = { itemUri: ITEM_URI } as BasketItem;
            const certificateItem = {} as CertificateItem;

            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: false }));
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

        it("redirects the user to orders url if user enrolled", async () => {
            const certificateItem = {} as CertificateItem;

            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));
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
