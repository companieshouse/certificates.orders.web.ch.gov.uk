import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../src/client/api.client";
import {
    CERTIFICATE_ADDITIONAL_COPIES_OPTIONS,
    replaceCertificateId
} from "../../../src/model/page.urls";

const CERTIFICATE_ID = "CRT-000000-000000";
const ADDITIONAL_COPIES_OPTIONS_URL =
    replaceCertificateId(CERTIFICATE_ADDITIONAL_COPIES_OPTIONS, CERTIFICATE_ID);
const ADDITIONAL_COPIES_OPTION_NOT_SELECTED: string = "Select ‘yes’ if you would like an additional copy of the certificate";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let getBasket;

describe("additional.copies.options.integration.test", () => {
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
        id: CERTIFICATE_ID,
        companyNumber: "12345678",
        itemOptions: {
            deliveryTimescale: "standard"
        },
        links: { self: `/orderable/certificates/${CERTIFICATE_ID}` }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the additional copies options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasket = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(ADDITIONAL_COPIES_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Would you like additional copies of the certificate?");
        });

        it("throws a validation error when no option selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(ADDITIONAL_COPIES_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send();

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(ADDITIONAL_COPIES_OPTION_NOT_SELECTED);
        });

    });

    describe("Route handling", () => {
        it("redirects to additional copies quantity page if 'Yes' is selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasket = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: false }));

            const resp = await chai.request(testApp)
                .post(ADDITIONAL_COPIES_OPTIONS_URL)
                .send({ additionalCopiesOptions: "true" })
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.include("Additional Copies Quantity - Order a certificate - GOV.UK");
        });

        it("redirects to delivery details page if 'No' is selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasket = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: false }));

            const resp = await chai.request(testApp)
                .post(ADDITIONAL_COPIES_OPTIONS_URL)
                .send({ additionalCopiesOptions: "false" })
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

                chai.expect(resp.status).to.equal(200);
                chai.expect(resp.text).to.include("Delivery details - Order a certificate - GOV.UK");
        });

    });

});