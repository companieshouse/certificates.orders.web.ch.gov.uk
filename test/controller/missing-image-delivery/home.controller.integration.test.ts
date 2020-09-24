import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { ROOT_MISSING_IMAGE_DELIVERY } from "../../../src/model/page.urls";

const sandbox = sinon.createSandbox();
let testApp = null;

describe("missingImageDelivery.home.controller.integration", () => {
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
            .get(ROOT_MISSING_IMAGE_DELIVERY);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Request a document");
    });
});
