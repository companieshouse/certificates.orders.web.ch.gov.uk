import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import * as apiClient from "../../../src/client/api.client";
import { SCAN_UPON_DEMAND_CREATE, replaceScudCompanyNumberAndFilingHistoryId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { ScudItem } from "ch-sdk-node/dist/services/order/scud/types";

const FILING_HISTORY_ID = "MzAwOTM2MDg5OWFkaXF6a2N4";
const COMPANY_NUMBER = "00006500";
const SCUD_CREATE_URL = replaceScudCompanyNumberAndFilingHistoryId(SCAN_UPON_DEMAND_CREATE, COMPANY_NUMBER, FILING_HISTORY_ID);

const sandbox = sinon.createSandbox();
let testApp = null;
let postScudItemStub;

describe("create.scud.item.controller.integration", () => {
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

    describe("scud item", () => {
        it("redirects the user to the check details page", async () => {
            const scudDetails = {
                id: "SCD-951616-000712"
            } as ScudItem;

            postScudItemStub = sandbox.stub(apiClient, "postScudItem")
                .returns(Promise.resolve(scudDetails));

            const resp = await chai.request(testApp)
                .get(SCUD_CREATE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to /orderable/scan-upon-demand/SCD-951616-000712/check-details");
        });
    });
});
