import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { CertificateItem } from "ch-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../src/client/api.client";
import { CERTIFICATE_REGISTERED_OFFICE_OPTIONS, replaceCertificateId } from "../../../src/model/page.urls";

const CERTIFICATE_ID = "CRT-000000-000000";
const REGISTERED_OFFICE_OPTION_NOT_SELECTED =
    "Select which registered office address you need on your certificate";
const REGISTERED_OFFICE_OPTIONS_URL =
    replaceCertificateId(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;

describe("registered.office.options.integration.test", () => {
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

    const patchedCertificateItem = {
        itemOptions: {
            forename: "john",
            surname: "smith",
            directorDetails: {
                includeBasicInformation: true
            }
        }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the registered office options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain("What registered office address information do you need?");
        });
    });

    describe("registered office options post", () => {
        it("redirects the user to the delivery-details page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    registeredOffice: "currentAddressAndTheTwoPrevious"
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to delivery-details");
        });

        it("redirects the user to the director-options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(patchedCertificateItem));

            const resp = await chai.request(testApp)
                .post(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    registeredOffice: "currentAddressAndTheTwoPrevious"
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to director-options");
        });

        it("throws a validation error when no option selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send();

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(REGISTERED_OFFICE_OPTION_NOT_SELECTED);
        });
    });
});
