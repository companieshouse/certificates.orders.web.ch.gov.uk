import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { SIGNED_OUT_COOKIE, signedOutSession } from "../__mocks__/redis.mocks";
import { getAppWithMockedCsrf } from '../__mocks__/csrf.mocks';

import {
    CERTIFICATE_OPTIONS,
    CERTIFICATE_DELIVERY_DETAILS,
    CERTIFICATE_CHECK_DETAILS,
    CERTIFIED_COPY_DELIVERY_DETAILS,
    CERTIFIED_COPY_CHECK_DETAILS,
    MISSING_IMAGE_DELIVERY_CHECK_DETAILS,
    MISSING_IMAGE_DELIVERY_CREATE,
    replaceCertificateId,
    replaceCertifiedCopyId,
    replaceCompanyNumberAndFilingHistoryId,
    replaceMissingImageDeliveryId,
    LP_CERTIFICATE_OPTIONS,
    LLP_CERTIFICATE_OPTIONS
} from "../../src/model/page.urls";

const PROTECTED_PAGED_CERTIFICATES = [
    CERTIFICATE_OPTIONS,
    CERTIFICATE_DELIVERY_DETAILS,
    CERTIFICATE_CHECK_DETAILS
];

const PROTECTED_PAGED_LP_CERTIFICATES = [
    LP_CERTIFICATE_OPTIONS
    // LP_CERTIFICATE_DELIVERY_DETAILS, TODO
    // LP_CERTIFICATE_CHECK_DETAILS TODO
];

const PROTECTED_PAGED_LLP_CERTIFICATES = [
    LLP_CERTIFICATE_OPTIONS
    // LLP_CERTIFICATE_DELIVERY_DETAILS, TODO
    // LLP_CERTIFICATE_CHECK_DETAILS TODO
];
const PROTECTED_PAGED_CERTIFIED_COPIES = [
    CERTIFIED_COPY_DELIVERY_DETAILS,
    CERTIFIED_COPY_CHECK_DETAILS
];

const CERTIFICATE_ID = "CRT-837816-028323";
const CERTIFIED_COPY_ID = "CCD-228916-028323";
const MISSING_IMAGE_DELIVERY_ID = "MID-368516-028323";
const FILING_HISTORY_ID = "MzAwOTM2MDg5OWFkaXF6a2N5";
const COMPANY_NUMBER = "00006500";

const sandbox = sinon.createSandbox();
let testApp = null;

describe("auth.middleware.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedOutSession));

        testApp = getAppWithMockedCsrf(sandbox);
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    PROTECTED_PAGED_CERTIFICATES.forEach((page) => {
        it("should redirect " + page + " to signin if user is not logged in", async () => {
            const resp = await chai.request(testApp)
                .get(replaceCertificateId(page, CERTIFICATE_ID))
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

            chai.expect(resp.redirects[0]).to.include("/signin");
        });
    });

    PROTECTED_PAGED_LP_CERTIFICATES.forEach((page) => {
        it("should redirect " + page + " to signin if user is not logged in", async () => {
            const resp = await chai.request(testApp)
                .get(replaceCertificateId(page, CERTIFICATE_ID))
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

            chai.expect(resp.redirects[0]).to.include("/signin");
        });
    });

    PROTECTED_PAGED_LLP_CERTIFICATES.forEach((page) => {
        it("should redirect " + page + " to signin if user is not logged in", async () => {
            const resp = await chai.request(testApp)
                .get(replaceCertificateId(page, CERTIFICATE_ID))
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

            chai.expect(resp.redirects[0]).to.include("/signin");
        });
    });

    PROTECTED_PAGED_CERTIFIED_COPIES.forEach((page) => {
        it("should redirect " + page + " to signin if user is not logged in", async () => {
            const resp = await chai.request(testApp)
                .get(replaceCertifiedCopyId(page, CERTIFIED_COPY_ID))
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

            chai.expect(resp.redirects[0]).to.include("/signin");
        });
    });

    it("should redirect " + MISSING_IMAGE_DELIVERY_CHECK_DETAILS + " to signin in if user is not logged in", async () => {
        const resp = await chai.request(testApp)
            .get(replaceMissingImageDeliveryId(MISSING_IMAGE_DELIVERY_CHECK_DETAILS, MISSING_IMAGE_DELIVERY_ID))
            .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

        chai.expect(resp.redirects[0]).to.include("/signin");
    });

    it("should redirect " + MISSING_IMAGE_DELIVERY_CREATE + " to signin in if user is not logged in", async () => {
        const resp = await chai.request(testApp)
            .get(replaceCompanyNumberAndFilingHistoryId(MISSING_IMAGE_DELIVERY_CREATE, COMPANY_NUMBER, FILING_HISTORY_ID))
            .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

        chai.expect(resp.redirects[0]).to.include("/signin");
    });
});
