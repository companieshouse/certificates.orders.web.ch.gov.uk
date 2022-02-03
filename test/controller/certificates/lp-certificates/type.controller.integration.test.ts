import sinon from "sinon";
import ioredis from "ioredis";

import * as apiClient from "../../../../src/client/api.client";
import { LP_CERTIFICATE_TYPE, replaceCertificateId } from "../../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { BadRequest, GatewayTimeout } from "http-errors";

const chai = require("chai");

const sandbox = sinon.createSandbox();
let testApp = null;
let postCertificateItemStub;
let postDissolvedCertificateItemStub;
const COMPANY_NUMBER = "OC006500";
const CERTIFICATE_TYPE_URL = replaceCertificateId(LP_CERTIFICATE_TYPE, COMPANY_NUMBER);

describe("type.controller.integration", () => {
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

    describe("certificate item", () => {
        it("redirects the user to the certificate options page for LP certificate", async () => {
            const certificateDetails = {
                id: "CRT-951616-000712",
                itemOptions: {
                    companyStatus: "active",
                    certificateType: "incorporation-with-all-name-changes"
                }
            } as CertificateItem;

            postCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.resolve(certificateDetails));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to /orderable/lp-certificates/CRT-951616-000712/certificate-options");
        });

        it("raises error when company status is invalid", async () => {
            postCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.reject(BadRequest));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(400);
            chai.expect(resp.text).to.include("You cannot use this service");
        });

        it("raises error when server error returned", async () => {
            postCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.reject(GatewayTimeout));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(500);
        });
    });

    describe("dissolved certificate item", () => {
        it("redirects the user to the delivery details page for dissolved certificates", async () => {
            const dissolvedCertificateDetails = {
                id: "CRT-951616-000712",
                itemOptions: {
                    certificateType: "dissolution",
                    companyStatus: "dissolved",
                    companyType: "limited-partnership"
                }
            } as CertificateItem;

            postDissolvedCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.resolve(dissolvedCertificateDetails));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to /orderable/dissolved-certificates/CRT-951616-000712/delivery-details");
        });
    });
});
