import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { ROOT_CERTIFIED_COPY, replaceCompanyNumber } from "../../../src/model/page.urls";

const COMPANY_NUMBER = "00000000";

const sandbox = sinon.createSandbox();
let testApp = null;

describe("certified-copy.home.controller.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());

        testApp = require("../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("renders the start page", async () => {
        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Order a certified document");
    });
});
