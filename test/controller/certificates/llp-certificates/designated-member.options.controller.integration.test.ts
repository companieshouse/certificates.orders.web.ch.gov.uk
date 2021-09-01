import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../../src/client/api.client";
import { LLP_CERTIFICATE_DESIGNATED_MEMBER_OPTIONS, replaceCertificateId } from "../../../../src/model/page.urls";

const CERTIFICATE_ID = "CRT-000000-000000";
const DESIGNATED_MEMBER_OPTIONS_NOT_SELECTED =
    "The certificate will include the names of all current company designated members, and any of the details you choose below.";
const DESIGNATED_MEMBER_OPTIONS_URL =
    replaceCertificateId(LLP_CERTIFICATE_DESIGNATED_MEMBER_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;

describe("designated-member.options.integration.test", () => {
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

    const designatedMemberDetailsCertificateItem = {
        itemOptions: {
            designatedMemberDetails: {
                includeAddress: false,
                includeAppointmentDate: true,
                includeBasicInformation: true,
                includeCountryOfResidence: false,
                includeDobType: "partial"
            }
        }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the designated member options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(DESIGNATED_MEMBER_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(DESIGNATED_MEMBER_OPTIONS_NOT_SELECTED);
        });
    });

    describe("designated member options patch", () => {
        it("redirects the user to the delivery details page", async () => {
            const certificateDetails = {} as CertificateItem;
            const emptyCertificateItem = {} as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(emptyCertificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(DESIGNATED_MEMBER_OPTIONS_URL)
                .redirects(0)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .send({
                    designatedMemberDetails: true
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.contain("Found. Redirecting to delivery-details");
        });

        it("redirects the user to the secretary options page when the secretary option is selected", async () => {
            const certificateDetails = {
                itemOptions: {
                    secretaryDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;
            const emptyCertificateItem = {} as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(emptyCertificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));

            const resp = await chai.request(testApp)
                .post(DESIGNATED_MEMBER_OPTIONS_URL)
                .redirects(0)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.contain("Found. Redirecting to secretary-options");
        });
    });

    describe("Check the page renders and retains checked boxes", () => {
        it("renders the designated member options page with previously selected options checked", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(designatedMemberDetailsCertificateItem));

            const resp = await chai.request(testApp)
                .get(DESIGNATED_MEMBER_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("#designated-member-options").prop("checked")).be.false;
            chai.expect($("#designated-member-options-2").prop("checked")).be.false;
            chai.expect($("#designated-member-options-3").prop("checked")).be.true;
            chai.expect($("#designated-member-options-4").prop("checked")).be.true;
        });
    });
});
