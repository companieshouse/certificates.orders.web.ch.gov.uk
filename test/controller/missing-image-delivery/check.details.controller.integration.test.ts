import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { MISSING_IMAGE_DELIVERY_CHECK_DETAILS, replaceMissingImageDeliveryId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";

const MISSING_IMAGE_DELIVERY_ID = "MID-869116-008636";
const ITEM_URI = "/orderable/missing-image-delivery/MID-869116-008636";
const CHECK_DETAILS_URL = replaceMissingImageDeliveryId(MISSING_IMAGE_DELIVERY_CHECK_DETAILS, MISSING_IMAGE_DELIVERY_ID);

const sandbox = sinon.createSandbox();
let testApp = null;

describe("check.details.controller.integration", () => {
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
            chai.expect($(".govuk-heading-xl").text()).to.equal("Confirm this is the document you want to order");
        });
    });
});
