import sinon from "sinon";
import ioredis from "ioredis";

import * as apiClient from "../../../src/client/api.client";
import { CERTIFICATE_TYPE, replaceCertificateId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { getAppWithMockedCsrf } from "../../__mocks__/csrf.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { ApiErrorResponse, ApiResponse, ApiResult } from "@companieshouse/api-sdk-node/dist/services/resource";
import { failure, success } from "@companieshouse/api-sdk-node/dist/services/result";

const chai = require("chai");

const sandbox = sinon.createSandbox();
let testApp = null;
let postCertificateItemStub;
let postDissolvedCertificateItemStub;
const COMPANY_NUMBER = "00006500";
const CERTIFICATE_TYPE_URL = replaceCertificateId(CERTIFICATE_TYPE, COMPANY_NUMBER);

describe("default.type.controller.integration", () => {
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

    describe("certificate item", () => {
        it("redirects the user to the certificate options page for standard certificate", async () => {
            const certificateDetails = {
                id: "CRT-951616-000712",
                itemOptions: {
                    companyStatus: "active",
                    certificateType: "incorporation-with-all-name-changes"
                }
            } as CertificateItem;
            const response: ApiResult<ApiResponse<CertificateItem>> = success({
                httpStatusCode: 201,
                resource: certificateDetails
            });

            postCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.resolve(response));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to /orderable/certificates/CRT-951616-000712/certificate-options");
        });

        it("raises client error when company status error returned by API", async () => {
            const response: ApiResult<ApiResponse<CertificateItem>> = failure({
                httpStatusCode: 400,
                errors: [{
                    error: "company-status-invalid"
                }]
            } as ApiErrorResponse);
            postCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.resolve(response));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(400);
            chai.expect(resp.text).to.include("You cannot use this service");
        });

        it("raises client error when undocumented bad request returned by API", async () => {
            const response: ApiResult<ApiResponse<CertificateItem>> = failure({
                httpStatusCode: 400,
                errors: [{
                    error: "Something went wrong"
                }]
            } as ApiErrorResponse);
            postCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.resolve(response));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(400);
        });

        it("raises internal server error when server error returned", async () => {
            const result: ApiResult<ApiResponse<CertificateItem>> = failure({
                httpStatusCode: 500
            });
            postCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.resolve(result));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(500);
        });

        it("raises internal server error when no resource returned", async () => {
            const result: ApiResult<ApiResponse<CertificateItem>> = success({
                httpStatusCode: 201
            });
            postCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.resolve(result));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(500);
        });

        it("raises error when invalid company status returned", async () => {
            const certificateDetails = {
                id: "CRT-951616-000712",
                itemOptions: {
                    companyStatus: "invalid",
                    certificateType: "incorporation-with-all-name-changes"
                }
            } as CertificateItem;
            const response: ApiResult<ApiResponse<CertificateItem>> = success({
                httpStatusCode: 201,
                resource: certificateDetails
            });

            postCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.resolve(response));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(400);
            chai.expect(resp.text).to.include("You cannot use this service");
        });
    });

    describe("dissolved certificate item", () => {
        it("redirects the user to the delivery details page for dissolved certificates", async () => {
            const dissolvedCertificateDetails = {
                id: "CRT-951616-000712",
                itemOptions: {
                    companyStatus: "dissolved",
                    certificateType: "dissolution"
                }
            } as CertificateItem;
            const response: ApiResult<ApiResponse<CertificateItem>> = success({
                httpStatusCode: 201,
                resource: dissolvedCertificateDetails
            });

            postDissolvedCertificateItemStub = sandbox.stub(apiClient, "postInitialCertificateItem")
                .returns(Promise.resolve(response));

            const resp = await chai.request(testApp)
                .get(CERTIFICATE_TYPE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to /orderable/dissolved-certificates/CRT-951616-000712/delivery-options");
        });
    });
});
