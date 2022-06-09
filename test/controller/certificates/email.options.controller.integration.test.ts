import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../src/client/api.client";
import { CERTIFICATE_EMAIL_OPTIONS, replaceCertificateId } from "../../../src/model/page.urls";

const CERTIFICATE_ID = "CRT-000000-000000";
const EMAIL_OPTION_NOT_SELECTED = "Select an option";
const EMAIL_OPTIONS_URL =
    replaceCertificateId(CERTIFICATE_EMAIL_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;

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

            const resp = await chai.request(testApp)
                .get(EMAIL_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($('h1').text().trim()).to.equal("Would you like an email copy of the certificate?");
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
});
