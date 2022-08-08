import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import * as apiClient from "../../../src/client/api.client";
import { Basket, ItemUriRequest } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {
    CERTIFIED_COPY_DELIVERY_OPTIONS,
    replaceCertifiedCopyId,
    
} from "../../../src/model/page.urls";
import { CertifiedCopyItem } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/types";

const CERTIFIED_COPY_ID = "CCD-000000-000000";
const DELIVERY_OPTION_NOT_SELECTED = "Select a delivery option";
const DELIVERY_OPTIONS_URL =
    replaceCertifiedCopyId(CERTIFIED_COPY_DELIVERY_OPTIONS, CERTIFIED_COPY_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertifiedCopyItemStub;
let patchCertifiedCopyItemStub;
let getBasketStub;
let appendItemToBasketStub;

describe("delivery.options.integration.test", () => {
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
        it("throws a validation error when no option selected", async () => {
            getCertifiedCopyItemStub = sandbox.stub(apiClient, "getCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyItem));

            const resp = await chai.request(testApp)
                .post(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send();

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(DELIVERY_OPTION_NOT_SELECTED);
        });
    });

    describe("delivery options patch", () => {
        it("redirects the user to the delivery-details page", async () => {
            const certifiedCopyDetails = {
                itemOptions: {
                    deliveryTimescale: "standard"
                }
            } as CertifiedCopyItem;

            getCertifiedCopyItemStub = sandbox.stub(apiClient, "getCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyDetails));
            patchCertifiedCopyItemStub = sandbox.stub(apiClient, "patchCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyDetails));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: false }));


            const resp = await chai.request(testApp)
                .post(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    deliveryOptions: "standard"
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to delivery-details");
        });

        it("adds item to basket and redirects user to the basket page if enrolled", async () => {
            const certifiedCopyDetails = {
                itemOptions: {
                    deliveryTimescale: "standard"
                },
                links: {
                    self: "/path/to/certifiedCopy"
                },
                kind: "item#certifiedCopy"
            } as CertifiedCopyItem;

            getCertifiedCopyItemStub = sandbox.stub(apiClient, "getCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyDetails));
            patchCertifiedCopyItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certifiedCopyDetails));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true, items: [{ kind: "item#certifiedCopy" } as any] }));
            sandbox.mock(apiClient).expects("appendItemToBasket")
                .once()
                .returns(Promise.resolve());

            const resp = await chai.request(testApp)
                .post(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    deliveryOptions: "standard"
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to /basket");
        });
    });

    describe("delivery options back button", () => {
        it("back button takes the user to the certified document page", async () => {
            getCertifiedCopyItemStub = sandbox.stub(apiClient, "getCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyItem));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("certified-documents");
        });
    });

    describe("delivery option checked", () => {
        it("displays checked option", async () => {
            const certifiedCopyDetails = {
                itemOptions: {
                    deliveryTimescale: "same-day"
                }
            } as CertifiedCopyItem;

            getCertifiedCopyItemStub = sandbox.stub(apiClient, "getCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyDetails));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.include(`<input class="govuk-radios__input" id="deliveryOptions" name="deliveryOptions" type="radio" value="same-day" checked aria-describedby="deliveryOptions-item-hint" data-event-id="express-delivery">`);
        });
    });
});
