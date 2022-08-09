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
        companyName: "test company",
        companyNumber: "00000000",
        customerReference: "reference",
        description: "description",
        descriptionIdentifier: "description identifier",
        descriptionValues: {
            key: "value"
        },
        etag: "etag",
        id: "CCD-123456-123456",
        itemCosts: [{
            itemCost: "10",
            productType: "type",
            discountApplied: "0",
            calculatedCost: "10"
        }],
        itemOptions: {
            collectionLocation: "cardiff",
            contactNumber: "0123456789",
            deliveryMethod: "postal",
            deliveryTimescale: "standard",
            filingHistoryDocuments: [{
                filingHistoryDate: "2010-02-12",
                filingHistoryDescription: "change-person-director-company-with-change-date",
                filingHistoryDescriptionValues: {
                    change_date: "2010-02-12",
                    officer_name: "Thomas David Wheare"
                },
                filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
                filingHistoryType: "CH01",
                filingHistoryCost: "15"
            }],
            forename: "forename",
            surname: "surname"
        },
        links: {
            self: "/path/to/certified-copy"
        },
        kind: "item#certified-copy",
        postalDelivery: true,
        postageCost: "0",
        quantity: 1,
        totalItemCost: "15"
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

    describe("delivery options patch", () => {
        it("redirects the user to the delivery-details page", async () => {
            getCertifiedCopyItemStub = sandbox.stub(apiClient, "getCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyItem));
            certifiedCopyItem.itemOptions.deliveryTimescale = "same-day";
            patchCertifiedCopyItemStub = sandbox.stub(apiClient, "patchCertifiedCopyItem")
                .returns(Promise.resolve(certifiedCopyItem));
            
            const resp = await chai.request(testApp)
                .post(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    deliveryOptions: "same-day"
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to delivery-details");
        });
    });

    describe("delivery options back button", () => {
        it("back button takes the user to the certificate options page if they have not selected any options", async () => {
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

    describe("delivery options validation", () => {
        it("throws a validation error when no option selected", async () => {

            const certifiedCopyItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith"
                }
            } as CertifiedCopyItem;

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

});