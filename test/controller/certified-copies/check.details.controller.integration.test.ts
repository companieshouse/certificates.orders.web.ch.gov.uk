import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import sessionHandler from "ch-node-session-handler";

import * as apiClient from "../../../src/client/api.client";
import { CERTIFIED_COPY_CHECK_DETAILS, replaceCertifiedCopyId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";

const CERTIFIED_COPY_ID = "CHS00000000000000001";
const ITEM_URI = "/orderable/certified-copies/CHS00000000000000052";
const CHECK_DETAILS_URL = replaceCertifiedCopyId(CERTIFIED_COPY_CHECK_DETAILS, CERTIFIED_COPY_ID);

const sandbox = sinon.createSandbox();
let testApp = null;

describe("certified-copy.check.details.controller.integration", () => {
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

    describe("check details get", () => {
        it("renders the check details screen", async () => {
            const resp = await chai.request(testApp)
                .get(CHECK_DETAILS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);
            const $ = cheerio.load(resp.text);
            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-heading-xl").text()).to.equal("Check your order details");
        });
    });
});
