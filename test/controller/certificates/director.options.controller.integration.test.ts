import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { CertificateItem } from "ch-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../src/client/api.client";
import { CERTIFICATE_DIRECTOR_OPTIONS, replaceCertificateId } from "../../../src/model/page.urls";

const CERTIFICATE_ID = "CRT-000000-000000";
const DIRECTOR_OPTIONS_NOT_SELECTED =
    "The certificate will include the names of all current company directors, and any of the details you choose below.";
const DIRECTOR_OPTIONS_URL =
    replaceCertificateId(CERTIFICATE_DIRECTOR_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;

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

    const certificateItem = {
        itemOptions: {
            forename: "john",
            surname: "smith"
        }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the director options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(DIRECTOR_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(DIRECTOR_OPTIONS_NOT_SELECTED);
        });
    });
});