import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import { signedInSession } from "../../__mocks__/redis.mocks";
const ACTUATOR_BASE_PATH = "/certificates-orders-web";
const HEALTH_ENDPOINT = "/health";
const INFO_ENDPOINT = "/info";
const METRICS_ENDPOINT = "/metrics";

const sandbox = sinon.createSandbox();
let testApp = null;

describe("actuator.endpoints.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").resolves();
        sandbox.stub(ioredis.prototype, "get").resolves(signedInSession);

        testApp = require("../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("actuator", () => {
        it("responds with successful health check", async () => {
            const response = await endpointIsOK(HEALTH_ENDPOINT);
            chai.expect(response.text).to.equal(`{"status":"UP"}`);
        });

        it("provides an info endpoint", async () => {
            endpointIsOK(INFO_ENDPOINT);
        });

        it("provides a metrics endpoint", async () => {
            endpointIsOK(METRICS_ENDPOINT);
        });
    });

    const endpointIsOK = async (endpoint: string) => {
        const resp = await chai.request(testApp)
            .get(ACTUATOR_BASE_PATH + endpoint);

        chai.expect(resp.status).to.equal(200);

        return resp;
    };
});
