import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import sessionHandler from "@companieshouse/node-session-handler";
import { BasketItem, Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";

import * as apiClient from "../../../src/client/api.client";
import { CERTIFICATE_CHECK_DETAILS, replaceCertificateId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import {
    mockBasketDetails,
    mockDissolvedCertificateItem
} from "../../__mocks__/certificates.mocks";

const CERTIFICATE_ID = "CHS00000000000000001";
const ITEM_URI = "/orderable/certificates/CHS00000000000000052";
const CHECK_DETAILS_URL = replaceCertificateId(CERTIFICATE_CHECK_DETAILS, CERTIFICATE_ID);

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
            chai.expect($(".currentCompanyDirectorsNames").text().trim()).to.equal("Including directors':<br>Correspondence addressOccupationDate of birth (month and year)Appointment dateNationalityCountry of residence");
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
            chai.expect($(".currentSecretariesNames").text().trim()).to.equal("Including secretaries':<br>Correspondence addressAppointment date");
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
