import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SCAN_UPON_DEMAND_CHECK_DETAILS, replaceScudId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";

const SCUD_ID = "SCD-869116-008636";
const ITEM_URI = "/orderable/scans-upon-demand/SCD-869116-008636";
const CHECK_DETAILS_URL = replaceScudId(SCAN_UPON_DEMAND_CHECK_DETAILS, SCUD_ID);


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
            chai.expect($(".govuk-heading-xl").text()).to.equal("Request a document");
        });
    });    
});
