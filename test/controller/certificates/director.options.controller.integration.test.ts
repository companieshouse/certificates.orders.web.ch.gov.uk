import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../src/client/api.client";
import { CERTIFICATE_DIRECTOR_OPTIONS, replaceCertificateId } from "../../../src/model/page.urls";
import { getAppWithMockedCsrf } from '../../__mocks__/csrf.mocks';

const CERTIFICATE_ID = "CRT-000000-000000";
const DIRECTOR_OPTIONS_NOT_SELECTED =
    "On 18th November 2025 the requirement for officers to provide Companies House with a business occupation was removed and it can no longer be included on certified certificates.<br>The certificate will include the names of all current company directors, and any of the details you choose below.";
const DIRECTOR_OPTIONS_URL =
    replaceCertificateId(CERTIFICATE_DIRECTOR_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp: null = null;
let getCertificateItemStub;
let patchCertificateItemStub;
let getBasketStub;

describe("director.options.integration.test", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        testApp = getAppWithMockedCsrf(sandbox);
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

    const directorDetailsCertificateItem = {
        itemOptions: {
            directorDetails: {
                includeAddress: false,
                includeAppointmentDate: true,
                includeBasicInformation: true,
                includeCountryOfResidence: false,
                includeDobType: "partial",
                includeNationality: false
            }
        }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the director options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(DIRECTOR_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(DIRECTOR_OPTIONS_NOT_SELECTED);
        });
    });

    describe("director options patch", () => {
        it("redirects the user to the delivery options page", async () => {
            const certificateDetails = {} as CertificateItem;
            const emptyCertificateItem = {} as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(emptyCertificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(DIRECTOR_OPTIONS_URL)
                .redirects(0)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .send({
                    directorDetails: true
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.contain("Found. Redirecting to delivery-options");
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
                .post(DIRECTOR_OPTIONS_URL)
                .redirects(0)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.contain("Found. Redirecting to secretary-options");
        });
    });

    describe("Check the page renders and retains checked boxes", () => {
        it("renders the director options page with previously selected options checked", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(directorDetailsCertificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(DIRECTOR_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("#director-options").prop("checked")).be.false;
            chai.expect($("#director-options-2").prop("checked")).be.true;
            chai.expect($("#director-options-3").prop("checked")).be.true;
            chai.expect($("#director-options-4").prop("checked")).be.false;
            chai.expect($("#director-options-5").prop("checked")).be.false;
        });
    });
});
