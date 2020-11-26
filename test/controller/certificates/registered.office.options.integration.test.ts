import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";

import { CERTIFICATE_REGISTERED_OFFICE_OPTIONS, replaceCertificateId } from "../../../src/model/page.urls";

const CERTIFICATE_ID = "CRT-354516-063896";

const sandbox = sinon.createSandbox();
let testApp = null;

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

    it("renders the registred office options page if company type is allowed to order a certificate", async () => {

        const resp = await chai.request(testApp)
            .get(replaceCertificateId(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, CERTIFICATE_ID))
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("What registered office address information do you need?");
    });
});
