import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import * as apiClient from "../../../src/client/api.client";
import { CertifiedCopyItem } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/types";
import { CERTIFIED_COPY_DELIVERY_OPTIONS, replaceCertifiedCopyId } from "../../../src/model/page.urls";
import { ItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/order";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCertifiedCopyItemStub;
let patchCertifiedCopyItemStub;
const CERTIFIED_COPY_ID = "CCD-123456-123456";
const DELIVERY_OPTION_NOT_SELECTED = "Select a delivery option";
const DELIVERY_OPTIONS_URL = replaceCertifiedCopyId(CERTIFIED_COPY_DELIVERY_OPTIONS, CERTIFIED_COPY_ID);

describe("delivery.options.controller.integration.test", () => {
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

    const certifiedCopyItem = {
        itemOptions: {
            forename: "john",
            surname: "smith"
        }
    } as CertifiedCopyItem;

    describe("Check the page renders", () => {
        it("renders the delivery options page", async () => {
            getCertifiedCopyItemStub = sandbox.stub(apiClient, "getCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyItem));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose a delivery option");
        });
    });

    describe("delivery options validation", () => {
        it.only("throws a validation error when no option selected", async () => {
            
            getCertifiedCopyItemStub = sandbox.stub(apiClient, "getCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyItem));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send();

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(DELIVERY_OPTION_NOT_SELECTED);
        });
    });

});