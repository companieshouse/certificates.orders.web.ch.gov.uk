import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../../src/client/api.client";
import { LLP_CERTIFICATE_MEMBERS_OPTIONS, replaceCertificateId } from "../../../../src/model/page.urls";

const CERTIFICATE_ID = "CRT-000000-000000";
const MEMBERS_OPTIONS_NOT_SELECTED =
    "The certificate will include the names of all current members, and any of the details you choose below.";
const MEMBERS_OPTIONS_URL =
    replaceCertificateId(LLP_CERTIFICATE_MEMBERS_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;

describe("members.options.integration.test", () => {
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

    const certificateItem = {
        itemOptions: {
            forename: "john",
            surname: "smith"
        }
    } as CertificateItem;

    const membersDetailsCertificateItem = {
        itemOptions: {
            memberDetails: {
                includeAddress: false,
                includeAppointmentDate: false,
                includeBasicInformation: true,
                includeCountryOfResidence: true,
                includeDobType: "partial"
            }
        }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the members options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(MEMBERS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(MEMBERS_OPTIONS_NOT_SELECTED);
        });
    });

    describe("members options patch", () => {
        it("redirects the user to the delivery details page", async () => {
            const emptyCertificateItem = {} as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(emptyCertificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(MEMBERS_OPTIONS_URL)
                .redirects(0)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .send({
                    memberDetails: true
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.contain("Found. Redirecting to delivery-options");
        });
    });

    describe("Check the page renders and retains checked boxes", () => {
        it("renders the members options page with previously selected options checked", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(membersDetailsCertificateItem));

            const resp = await chai.request(testApp)
                .get(MEMBERS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("#include-address").prop("checked")).be.false;
            chai.expect($("#include-dob-type").prop("checked")).be.true;
            chai.expect($("#include-appointment-date").prop("checked")).be.false;
            chai.expect($("#include-country-of-residence").prop("checked")).be.true;
        });
    });
});
