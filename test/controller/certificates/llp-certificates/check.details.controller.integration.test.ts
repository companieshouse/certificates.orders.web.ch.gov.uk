import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";

import * as apiClient from "../../../../src/client/api.client";
import {
    LLP_CERTIFICATE_CHECK_DETAILS,
    LLP_CERTIFICATE_VIEW_CHANGE_OPTIONS,
    replaceCertificateId
} from "../../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../../__mocks__/redis.mocks";
import { mockBasketDetails, mockDissolvedCertificateItem } from "../../../__mocks__/certificates.mocks";
import { DobType } from "../../../../src/model/DobType";
const chai = require("chai");

const CERTIFICATE_ID = "CHS00000000000000001";
const ITEM_URI = "/orderable/llp-certificates/CHS00000000000000052";
const CHECK_DETAILS_URL = replaceCertificateId(LLP_CERTIFICATE_CHECK_DETAILS, CERTIFICATE_ID);
const VIEW_UPDATE_OPTIONS_URL = replaceCertificateId(LLP_CERTIFICATE_VIEW_CHANGE_OPTIONS, CERTIFICATE_ID);

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

describe("LLP certificate.check.details.controller.integration", () => {
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

    describe("LLP check details get", () => {
        it("renders the check details screen", async () => {
            const certificateItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemCosts: [{
                    itemCost: "15"
                }],
                itemOptions: {
                    companyStatus: "active",
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
            chai.expect($(".govuk-summary-list__row:nth-of-type(4)").find(".govuk-summary-list__key").text().trim()).to.include("Statement of good standing");
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
                    companyStatus: "active",
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
                .get(VIEW_UPDATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-heading-xl").text()).to.equal("Check your certificate");
            chai.expect($("#cert-options-heading").text()).to.equal("Certificate options");
            chai.expect($(".govuk-summary-list__row:nth-of-type(4)").find(".govuk-summary-list__key").text().trim()).to.include("Statement of good standing");
            chai.expect($(".govuk-summary-list__row:nth-of-type(8)").find(".govuk-summary-list__key").text().trim()).to.include("Delivery method");
        });

        it("Renders email copy option in alternate check details template if user enrolled and same-day delivery requested", async () => {
            const certificateItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemCosts: [{
                    itemCost: "15"
                }],
                itemOptions: {
                    companyStatus: "active",
                    certificateType: "cert type",
                    forename: "john",
                    surname: "smith",
                    deliveryTimescale: "same-day",
                    includeEmailCopy: false
                }
            } as CertificateItem;
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ ...basketDetails, enrolled: true }));

            const resp = await chai.request(testApp)
                .get(VIEW_UPDATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-heading-xl").text()).to.equal("Check your certificate");
            chai.expect($("#cert-options-heading").text()).to.equal("Certificate options");
            chai.expect($(".govuk-summary-list__row:nth-of-type(4)").find(".govuk-summary-list__key").text().trim()).to.include("Statement of good standing");
            chai.expect($(".govuk-summary-list__row:nth-of-type(8)").find(".govuk-summary-list__key").text().trim()).to.include("Delivery method");
            chai.expect($(".govuk-summary-list__row:nth-of-type(9)").find(".govuk-summary-list__key").text().trim()).to.include("Email copy required");
        });

        it("renders the check details screen for an LLP in liquidation", async () => {
            const certificateItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemCosts: [{
                    itemCost: "15"
                }],
                itemOptions: {
                    companyStatus: "liquidation",
                    certificateType: "cert type",
                    forename: "john",
                    surname: "smith",
                    deliveryTimescale: "standard",
                    includeEmailCopy: false,
                    liquidatorsDetails: {
                        includeBasicInformation: true
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
            chai.expect($(".govuk-heading-xl").text()).to.equal("Check your order details");
            chai.expect($("#orderDetails").text()).to.equal("Order details");
            chai.expect($(".govuk-summary-list__row:nth-of-type(7)").find(".govuk-summary-list__key").text().trim()).to.equal("Liquidators' details");
            chai.expect($(".liquidators").text().trim()).to.equal("Yes");
            chai.expect($(".govuk-summary-list__row:nth-of-type(2)").find(".govuk-summary-list__key").text().trim()).to.include("Email copy required");
            chai.expect($(".govuk-summary-list__row:nth-of-type(2)").find(".govuk-summary-list__value").text().trim()).to.include("Email only available for express delivery method");
        });

        it("renders the check details screen for an LLP in administration", async () => {
            const certificateItem = {
                companyName: "test company",
                companyNumber: "00000000",
                itemCosts: [{
                    itemCost: "15"
                }],
                itemOptions: {
                    companyStatus: "administration",
                    certificateType: "cert type",
                    forename: "john",
                    surname: "smith",
                    deliveryTimescale: "standard",
                    includeEmailCopy: false,
                    administratorsDetails: {
                        includeBasicInformation: true
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
            chai.expect($(".govuk-heading-xl").text()).to.equal("Check your order details");
            chai.expect($("#orderDetails").text()).to.equal("Order details");
            chai.expect($(".govuk-summary-list__row:nth-of-type(7)").find(".govuk-summary-list__key").text().trim()).to.equal("Administrators' details");
            chai.expect($(".administrators").text().trim()).to.equal("Yes");
            chai.expect($(".govuk-summary-list__row:nth-of-type(2)").find(".govuk-summary-list__key").text().trim()).to.include("Email copy required");
            chai.expect($(".govuk-summary-list__row:nth-of-type(2)").find(".govuk-summary-list__value").text().trim()).to.include("Email only available for express delivery method");
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
                    companyStatus: "active",
                    certificateType: "cert type",
                    forename: "john",
                    surname: "smith",
                    includeGoodStandingInformation: true
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
        });
    });

    describe("check correct value is shown for registered office address field", () => {
        it("returns the mapped value for registered office address", async () => {
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
                    registeredOfficeAddressDetails: {
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
            chai.expect($(".registeredOfficeAddress").text().trim()).to.equal("All current and previous addresses");
        });
    });

    describe("check correct value is shown for all designated members options selected", () => {
        it("returns the mapped value for designated members options", async () => {
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
                    designatedMemberDetails: {
                        includeAddress: true,
                        includeAppointmentDate: true,
                        includeBasicInformation: true,
                        includeCountryOfResidence: true,
                        includeDobType: DobType.PARTIAL
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
            chai.expect($(".currentDesignatedMembersNames").text().trim()).to.equal("Including designated members':Correspondence addressAppointment dateCountry of residenceDate of birth (month and year)");
        });
    });

    describe("check correct value is shown for all members options selected", () => {
        it("returns the mapped value for members options", async () => {
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
                    memberDetails: {
                        includeAddress: true,
                        includeAppointmentDate: true,
                        includeBasicInformation: true,
                        includeCountryOfResidence: true,
                        includeDobType: DobType.PARTIAL
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
            chai.expect($(".currentMembersNames").text().trim()).to.equal("Including members':Correspondence addressAppointment dateCountry of residenceDate of birth (month and year)");
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
            chai.expect(resp.text).to.contain("Email copy required");
        });
    });

    describe("check details post", () => {
        it("redirects the user to orders url", async () => {
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
    });
});
