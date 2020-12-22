import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../src/client/api.client";
import { CERTIFICATE_SECRETARY_OPTIONS, replaceCertificateId } from "../../../src/model/page.urls";

const CERTIFICATE_ID = "CRT-000000-000000";
const SECRETARY_OPTIONS_INFO_TEXT =
    "We aim to include the names of all current company secretaries, along with any of the details you choose below.";
const SECRETARY_OPTIONS_URL =
    replaceCertificateId(CERTIFICATE_SECRETARY_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;

const secretaryDetailsCertificateItem = {
    itemOptions: {
        secretaryDetails: {
            includeAddress: false,
            includeAppointmentDate: true,
            includeBasicInformation: true
        }
    }
} as CertificateItem;

describe("secretary.options.integration.test", () => {
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
            forename: "john",
            surname: "smith"
        }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the secretary options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(SECRETARY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(SECRETARY_OPTIONS_INFO_TEXT);
        });
    });
    describe("registered office options patch", () => {
        it("redirects the user to the delivery-details page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(SECRETARY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    includeAddress: true,
                    includeAppointmentDate: false,
                    includeBasicInformation: true
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to delivery-details");
        });
    });
    describe("Check the secretary page renders and retains checked boxes", () => {
        it("renders the secretary options page with previously selected options checked", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(secretaryDetailsCertificateItem));

            const resp = await chai.request(testApp)
                .get(SECRETARY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("#secretary-options").prop("checked")).be.false;
            chai.expect($("#secretary-options-2").prop("checked")).be.true;
        });
    });
});
