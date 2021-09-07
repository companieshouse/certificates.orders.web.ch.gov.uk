import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../../src/client/api.client";
import {LP_CERTIFICATE_PRINCIPLE_PLACE_OPTIONS, replaceCertificateId} from "../../../../src/model/page.urls";
import {PrinciplePlaceOfBusinessOptionName} from "../../../../src/controllers/certificates/lp-certificates/PrinciplePlaceOfBusinessOptionName";
import {PRINCIPLE_PLACE_OPTION_NOT_SELECTED} from "../../../../src/model/error.messages";

const CERTIFICATE_ID = "CRT-000000-000000";

const PRINCIPLE_PLACE_OF_BUSINESS_OPTIONS_URL =
    replaceCertificateId(LP_CERTIFICATE_PRINCIPLE_PLACE_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;

describe("place.of.business.options.integration.test", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        testApp = require("../../../../src/app").default;
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
        it("renders the place of business options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(PRINCIPLE_PLACE_OF_BUSINESS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($('h1').text().trim()).to.equal("What principle place of business information do you need?");
            chai.expect($('title').text().trim()).to.equal("Principle place of business options - Order a certificate - GOV.UK");
        });

        it("renders the full place of business options page if full layout requested", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(PRINCIPLE_PLACE_OF_BUSINESS_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($('h1').text().trim()).to.equal("Choose from the full list of principle places of business");
            chai.expect($('title').text().trim()).to.equal("Full list of principle place of business options - Order a certificate - GOV.UK");
        })
    });

    describe("place of business options post", () => {
        it("redirects the user to the delivery-details page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(PRINCIPLE_PLACE_OF_BUSINESS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    principlePlace: PrinciplePlaceOfBusinessOptionName.CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to delivery-details");
        });

        it("throws a validation error when no option selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(PRINCIPLE_PLACE_OF_BUSINESS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send();

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(PRINCIPLE_PLACE_OPTION_NOT_SELECTED);
        });
    });
});
