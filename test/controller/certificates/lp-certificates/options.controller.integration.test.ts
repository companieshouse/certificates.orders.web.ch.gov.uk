import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";

import * as apiClient from "../../../../src/client/api.client";
import { LP_CERTIFICATE_OPTIONS, replaceCertificateId } from "../../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../../__mocks__/redis.mocks";
import { DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED } from "../../../../src/config/config";

const CERTIFICATE_ID = "CHS00000000000000001";
const LP_CERTIFICATE_OPTIONS_URL = replaceCertificateId(LP_CERTIFICATE_OPTIONS, CERTIFICATE_ID);

const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;

describe("lp.certificate.options.controller.integration", () => {
    const certificateItem = {
        itemOptions: {
            directorDetails: {
                includeBasicInformation: true
            },
            includeCompanyObjectsInformation: true,
            includeGoodStandingInformation: true,
            registeredOfficeAddressDetails: {
                includeAddressRecordsType: "current"
            },
            secretaryDetails: {
                includeBasicInformation: true
            }
        }
    } as CertificateItem;

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

    describe("certificate options get", () => {
        it("renders the certificate options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(LP_CERTIFICATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-fieldset__heading").text().trim()).to
                .equal("What information would you like to be included on the certificate?");
        });
    });

    describe("certificate options patch", () => {
        it("redirects the user to the delivery-details page", async () => {
            const certificateDetails = {} as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));

            const resp = await chai.request(testApp)
                .post(LP_CERTIFICATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    moreInfo: ["goodStanding"]
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to delivery-details");
        });

        it("redirects the user to the principle-place-of-business-options page", async () => {
            const certificateDetails = {} as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));

            const resp = await chai.request(testApp)
                .post(LP_CERTIFICATE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    moreInfo: ["goodStanding", "principlePlaceOfBusiness"]
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to principle-place-of-business-options");
        });
    });
});