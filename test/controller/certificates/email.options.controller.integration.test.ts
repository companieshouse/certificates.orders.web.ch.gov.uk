import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../src/client/api.client";
import {
    CERTIFICATE_EMAIL_OPTIONS,
    DISSOLVED_CERTIFICATE_EMAIL_OPTIONS,
    replaceCertificateId
} from "../../../src/model/page.urls";
import { setBackLink } from "../../../src/controllers/certificates/email.options.controller";
import { dataEmpty } from "../../__mocks__/session.mocks";
import { mockDissolvedCertificateItem, mockDeliveryDetails as deliveryDetails } from "../../__mocks__/certificates.mocks";
import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket";

const CERTIFICATE_ID = "CRT-000000-000000";
const EMAIL_OPTION_NOT_SELECTED = "Select ‘yes’ if you would like an email copy of the certificate";
const EMAIL_OPTIONS_URL =
    replaceCertificateId(CERTIFICATE_EMAIL_OPTIONS, CERTIFICATE_ID);
const DISSOLVED_EMAIL_OPTIONS_URL =
    replaceCertificateId(DISSOLVED_CERTIFICATE_EMAIL_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;
let getBasket;

describe("email.options.integration.test", () => {
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

    const certificateItem = {
        itemOptions: {
            deliveryTimescale: "deliveryOption"
        }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the email options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasket = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(EMAIL_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Would you like an email copy of the certificate?");
        });

        it("renders the email options page for a dissolved company", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasket = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(DISSOLVED_EMAIL_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Would you like an email copy of the certificate?");
        });
    });

    describe("email options validation", () => {
        it("throws a validation error when no option selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(EMAIL_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send();

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(EMAIL_OPTION_NOT_SELECTED);
        });
    });

    describe("email options patch", () => {
        it("redirects the user to the additional-copies page", async () => {
            const certificateDetails = {
                itemOptions: {
                    includeEmailCopy: false
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            getBasket = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: false }));

            const resp = await chai.request(testApp)
                .post(EMAIL_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    emailOptions: false
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to additional-copies");
        });

        it("enrolled user redirected to additional copies page if no other deliverable items", async () => {
            const certificateDetails = {
                itemOptions: {
                    includeEmailCopy: false
                },
                links: {
                    self: "/path/to/certificate"
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            getBasket = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true, items: [{ kind: "item#missing-image-delivery" } as any] }));
            sandbox.mock(apiClient).expects("appendItemToBasket")
                .once()
                .returns(Promise.resolve());

            const resp = await chai.request(testApp)
                .post(EMAIL_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    emailOptions: false
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to additional-copies");
        });
    });

    describe("setBackUrl for certificate", () => {
        it("the back button link should take the user to the delivery options page", () => {
            const certificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith"
                }
            } as CertificateItem;
            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("delivery-options");
        });
    });

    describe("setBackUrl for dissolved certificate", () => {
        it("the back button link should take the user to the delivery options page", () => {
            const certificateItem = mockDissolvedCertificateItem as CertificateItem;
            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("delivery-options");
        });
    });
});
