import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { SIGNED_OUT_COOKIE, signedOutSession } from "../__mocks__/redis.mocks";

import {
    CERTIFICATE_OPTIONS,
    DELIVERY_DETAILS,
    CHECK_DETAILS,
    replaceCertificateId
} from "../../src/model/page.urls";

const PROTECTED_PAGED = [
    CERTIFICATE_OPTIONS,
    DELIVERY_DETAILS,
    CHECK_DETAILS
];

const CERTIFICATE_ID = "CHS00000000000000000";

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

    PROTECTED_PAGED.forEach((page) => {
        it("should redirect " + page + " to signin if user is not logged in", async () => {
            const resp = await chai.request(testApp)
                .get(replaceCertificateId(page, CERTIFICATE_ID))
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

            chai.expect(resp.redirects[0]).to.include("/signin");
        });
    });
});
