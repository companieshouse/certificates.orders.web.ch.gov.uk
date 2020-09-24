import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { SIGNED_OUT_COOKIE, signedOutSession } from "../__mocks__/redis.mocks";

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
    replaceCompanyNumberAndFilingHistoryId
} from "../../src/model/page.urls";

const PROTECTED_PAGED_CERTIFICATES = [
    CERTIFICATE_OPTIONS,
    CERTIFICATE_DELIVERY_DETAILS,
    CERTIFICATE_CHECK_DETAILS
];

const PROTECTED_PAGED_CERTIFIED_COPIES = [
    CERTIFIED_COPY_DELIVERY_DETAILS,
    CERTIFIED_COPY_CHECK_DETAILS
];

const PROTECTED_PAGED_MISSING_IMAGE_DELIVERY = [
    MISSING_IMAGE_DELIVERY_CHECK_DETAILS,
    MISSING_IMAGE_DELIVERY_CREATE
];

const CERTIFICATE_ID = "CHS00000000000000000";
const CERTIFIED_COPY_ID = "CHS00000000000000001";
const FILING_HISTORY_ID = "MzAwOTM2MDg5OWFkaXF6a2N5";
const COMPANY_NUMBER = "00006500";

const sandbox = sinon.createSandbox();
let testApp = null;

describe("auth.middleware.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedOutSession));

        testApp = require("../../src/app").default;
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

    PROTECTED_PAGED_CERTIFIED_COPIES.forEach((page) => {
        it("should redirect " + page + " to signin if user is not logged in", async () => {
            const resp = await chai.request(testApp)
                .get(replaceCertifiedCopyId(page, CERTIFIED_COPY_ID))
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

            chai.expect(resp.redirects[0]).to.include("/signin");
        });
    });

    PROTECTED_PAGED_MISSING_IMAGE_DELIVERY.forEach((page) => {
        it("should redirect " + page + " to signin in if user is not logged in", async () => {
            const resp = await chai.request(testApp)
                .get(replaceCompanyNumberAndFilingHistoryId(page, COMPANY_NUMBER, FILING_HISTORY_ID))
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

            chai.expect(resp.redirects[0]).to.include("/signin");
        });
    });
});
