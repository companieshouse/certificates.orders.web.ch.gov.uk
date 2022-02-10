import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";

import * as apiClient from "../../../src/client/api.client";
import { CERTIFICATE_OPTIONS, replaceCertificateId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";

const CERTIFICATE_ID = "CHS00000000000000001";
const CERTIFICATE_OPTIONS_URL = replaceCertificateId(CERTIFICATE_OPTIONS, CERTIFICATE_ID);

const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;

describe("certificate.options.controller.integration", () => {
    const certificateItem = {
        companyNumber: "12345678",
        itemOptions: {
            companyStatus: "active",
            directorDetails: {
                includeBasicInformation: true
            },
            includeCompanyObjectsInformation: true,
            includeGoodStandingInformation: true,
            registeredOfficeAddressDetails: {
            },
            secretaryDetails: {
                includeBasicInformation: true
            }
        }
    } as CertificateItem;

    const certificateItemLiquidated = {
        itemOptions: {
            companyStatus: "liquidation",
            directorDetails: {
                includeBasicInformation: true
            },
            includeCompanyObjectsInformation: true,
            registeredOfficeAddressDetails: {
                includeAddressRecordsType: "current"
            },
            secretaryDetails: {
                includeBasicInformation: true
            },
            liquidatorsDetails: {
                includeBasicInformation: true
            }
        }
    } as CertificateItem;

    const certificateDetails = {
        itemOptions: {
            companyStatus: "active"
        }
    } as CertificateItem;

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

    describe("certificate options get", () => {
        it("renders the certificate options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-fieldset__heading").text().trim()).to
                .equal("What information would you like to be included on the certificate?");
            chai.expect($(".govuk-checkboxes__item").length).to.be.greaterThan(0);
            chai.expect($(".govuk-checkboxes__item:first").find("label").text().trim()).to.equal("Statement of good standing");
        });

        it("renders the certificate options page for a liquidated company", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemLiquidated));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-fieldset__heading").text().trim()).to
                .equal("What information would you like to be included on the certificate?");
            chai.expect($(".govuk-checkboxes__item").length).to.be.greaterThan(0);
            chai.expect($(".govuk-checkboxes__item:nth-of-type(5)").find("label").text().trim()).to.equal("Liquidators");
        });
    });

    describe("certificate options patch", () => {
        it("redirects the user to the delivery-details page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));

            const resp = await chai.request(testApp)
                .post(CERTIFICATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    moreInfo: ["goodStanding"]
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to delivery-details");
        });

        it("redirects the user to the registered-office-options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));

            const resp = await chai.request(testApp)
                .post(CERTIFICATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    moreInfo: ["goodStanding", "registeredOffice"]
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to registered-office-options");
        });

        it("redirects the user to the director-options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));

            const resp = await chai.request(testApp)
                .post(CERTIFICATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    moreInfo: ["goodStanding", "directors"]
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to director-options");
        });

        it("redirects the user to the secretary-options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));

            const resp = await chai.request(testApp)
                .post(CERTIFICATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    moreInfo: ["goodStanding", "secretaries"]
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to secretary-options");
        });
    });
});
