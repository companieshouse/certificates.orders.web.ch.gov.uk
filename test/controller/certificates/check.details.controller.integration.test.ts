import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { Item as BasketItem } from "@companieshouse/api-sdk-node/dist/services/order/order/types";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";

import * as apiClient from "../../../src/client/api.client";
import {
    CERTIFICATE_CHECK_DETAILS,
    CERTIFICATE_VIEW_CHANGE_OPTIONS,
    replaceCertificateId
} from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { mockBasketDetails, mockDissolvedCertificateItem } from "../../__mocks__/certificates.mocks";
const chai = require("chai");

const CERTIFICATE_ID = "CHS00000000000000001";
const ITEM_URI = "/orderable/certificates/CHS00000000000000052";
const CHECK_DETAILS_URL = replaceCertificateId(CERTIFICATE_CHECK_DETAILS, CERTIFICATE_ID);
const VIEW_UPDATE_OPTIONS_URL = replaceCertificateId(CERTIFICATE_VIEW_CHANGE_OPTIONS, CERTIFICATE_ID);

const basketDetails = {
    deliveryDetails: {
        addressLine1: "117 kings road",
        addressLine2: "pontcanna",
        companyName: "company name",
        country: "wales",
        locality: "canton",
        postalCode: "cf5 4xb",
        region: "glamorgan"
    }
} as Basket;

const certificateItemTemplate = {
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
        surname: "smith",
        registeredOfficeAddressDetails: {
            includeAddressRecordsType: "all"
        },
        directorDetails: {
            includeAddress: true,
            includeAppointmentDate: true,
            includeBasicInformation: true,
            includeCountryOfResidence: true,
            includeDobType: "partial",
            includeNationality: true,
            includeOccupation: true
        },
        secretaryDetails: {
            includeBasicInformation: true,
            includeAddress: true,
            includeAppointmentDate: true
        }
    }
} as CertificateItem;

const certificateItem = {
    ...certificateItemTemplate,
    itemOptions: {
        ...certificateItemTemplate.itemOptions,
        companyStatus: "active",
        includeGoodStandingInformation: true
    }
};

const liquidationCertificateItem = {
    ...certificateItem,
    itemOptions: {
        ...certificateItem.itemOptions,
        companyStatus: "liquidation",
        liquidatorsDetails: {
            includeBasicInformation: true
        },
        includeGoodStandingInformation: false
    }
};

const administrationCertificateItem = {
    ...certificateItem,
    itemOptions: {
        ...certificateItem.itemOptions,
        companyStatus: "administration",
        administratorsDetails: {
            includeBasicInformation: true
        },
        includeGoodStandingInformation: true
    }
};

const sandbox = sinon.createSandbox();
let testApp = null;
let addItemToBasketStub;
let getCertificateItemStub;
let getBasketStub;

describe("certificate.check.details.controller.integration", () => {
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
            chai.expect($(".govuk-summary-list__row:nth-of-type(4)").find(".govuk-summary-list__key").text().trim()).to.include("Summary statement previously known as statement of good standing");
        });

        it("renders the view/change certificate options page", async () => {
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
            chai.expect($(".govuk-summary-list__row:nth-of-type(4)").find(".govuk-summary-list__key").text().trim()).to.include("Summary statement previously known as statement of good standing");
            chai.expect($(".govuk-summary-list__row:nth-of-type(9)").find(".govuk-summary-list__key").text().trim()).to.include("Dispatch method");
            chai.expect($(".govuk-summary-list__row:nth-of-type(10)").find(".govuk-summary-list__key").text().trim()).to.include("Email copy required");
        });

        it("renders the check details screen for a company in liquidation", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(liquidationCertificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-heading-xl").text()).to.equal("Check your order details");
            chai.expect($("#orderDetails").text()).to.equal("Order details");
            chai.expect($(".govuk-summary-list__row:nth-of-type(8)").find(".govuk-summary-list__key").text().trim()).to.equal("Liquidators' details");
            chai.expect($(".liquidators").text().trim()).to.equal("Yes");
        });

        it("renders the check details screen for a company in administration", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(administrationCertificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-heading-xl").text()).to.equal("Check your order details");
            chai.expect($("#orderDetails").text()).to.equal("Order details");
            chai.expect($(".govuk-summary-list__row:nth-of-type(8)").find(".govuk-summary-list__key").text().trim()).to.equal("Administrators' details");
            chai.expect($(".administrators").text().trim()).to.equal("Yes");
        });
    });

    describe("check value returns yes or no for certificate item options", () => {
        it("returns a yes or no value if selected on certificate item options", async () => {
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
            chai.expect($(".companyObjects").text().trim()).to.equal("Yes");
        });
    });

    describe("check correct value is shown for registered office address field", () => {
        it("returns the mapped value for registered office address", async () => {
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

    describe("check correct value is shown for all director options selected", () => {
        it("returns the mapped value for director options", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".currentCompanyDirectorsNames").text().trim()).to.equal("Including directors':Correspondence addressOccupationDate of birth (month and year)Appointment dateNationalityCountry of residence");
        });
    });

    describe("check correct value is shown for all secretary options selected", () => {
        it("returns the mapped value for secretary options", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".currentSecretariesNames").text().trim()).to.equal("Including secretaries':Correspondence addressAppointment date");
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
            chai.expect(resp.text).to.contain("Email copy required\n          </dt>\n          <dd class=\"govuk-summary-list__value\">\n            Yes\n");
            chai.expect(resp.text).to.contain(" Dispatch method\n          </dt>\n          <dd class=\"govuk-summary-list__value\">\n            Express (Orders received before 11am will be sent out the same day. Orders received after 11am will be sent out the next working day)\n");
        });
    });

    describe("check details post", () => {
        it("redirects the user to orders url", async () => {
            const itemUri = { itemUri: ITEM_URI } as BasketItem;
            const certificateItem = {} as CertificateItem;

            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));
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
