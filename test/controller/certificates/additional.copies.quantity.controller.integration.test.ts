import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import * as cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../src/client/api.client";
import { mockDeliveryDetails as deliveryDetails } from "../../__mocks__/certificates.mocks";
import { getAppWithMockedCsrf } from "../../__mocks__/csrf.mocks";
import {
    CERTIFICATE_ADDITIONAL_COPIES_QUANTITY_OPTIONS,
    replaceCertificateId
} from "../../../src/model/page.urls";

const CERTIFICATE_ID = "CRT-000000-000000";
const ADDITIONAL_COPIES_QUANTITY_OPTION_NOT_SELECTED = "Select how many additional copies you need";
const ADDITIONAL_COPIES_QUANTITY_OPTIONS_URL =
    replaceCertificateId(CERTIFICATE_ADDITIONAL_COPIES_QUANTITY_OPTIONS, CERTIFICATE_ID);

const sandbox = sinon.createSandbox();
let testApp: null = null;
let getCertificateItemStub;
let patchCertificateItemStub;
let getBasket;

describe("additional.copies.quantity.integration.test", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        testApp = getAppWithMockedCsrf(sandbox);
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
        it("renders the additional copies quantity options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasket = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(ADDITIONAL_COPIES_QUANTITY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("How many additional copies do you need?");
        });
    });

    describe("additional copies quantity options validation", () => {
        it("throws a validation error when no option selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            const resp = await chai.request(testApp)
                .post(ADDITIONAL_COPIES_QUANTITY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send();
            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(ADDITIONAL_COPIES_QUANTITY_OPTION_NOT_SELECTED);
        });
    });

    describe("Route handling", () => {
        it("redirects to delivery details page when quantity is selected", async () => {
            const certificateDetails = {
                itemOptions: {
                    includeEmailCopy: false
                },
                links: {
                    self: "/path/to/certificate"
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            getBasket = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: false }));

            const resp = await chai.request(testApp)
                .post(ADDITIONAL_COPIES_QUANTITY_OPTIONS_URL)
                .send({ additionalCopiesQuantityOptions: 2 })
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.include("Delivery details - Order a certificate - GOV.UK");
        });
    });
    it("adds item to basket and redirects the user to the basket page if enrolled", async () => {
        const certificateDetails = {
            itemOptions: {
                includeEmailCopy: false
            },
            links: {
                self: "/path/to/certificate"
            }
        } as CertificateItem;

        getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
            .returns(Promise.resolve(certificateDetails));
        patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
            .returns(Promise.resolve(certificateDetails));
        getBasket = sandbox.stub(apiClient, "getBasket")
            .returns(Promise.resolve({ enrolled: true, items: [{ kind: "item#certificate" } as any], deliveryDetails }));
        sandbox.mock(apiClient).expects("appendItemToBasket")
            .once()
            .returns(Promise.resolve());

        const resp = await chai.request(testApp)
            .post(ADDITIONAL_COPIES_QUANTITY_OPTIONS_URL)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
            .redirects(0)
            .send({ additionalCopiesQuantityOptions: 2 });

        chai.expect(resp.status).to.equal(302);
        chai.expect(resp.text).to.include("/basket");
    });

    describe("Quantity update", () => {
        it("redirects to delivery details page when quantity is selected", async () => {
            const initialQuantity = 1;
            const additionalCopiesQuantity = 2;
            const expectedQuantity = initialQuantity + additionalCopiesQuantity;
            const certificateDetails = {
                itemOptions: {
                    includeEmailCopy: false
                },
                links: {
                    self: "/path/to/certificate"
                },
                quantity: initialQuantity
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .callsFake(() => {
                    certificateDetails.quantity += additionalCopiesQuantity;
                    return Promise.resolve(certificateDetails);
                });
            getBasket = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: false }));

            const resp = await chai.request(testApp)
                .post(ADDITIONAL_COPIES_QUANTITY_OPTIONS_URL)
                .send({ additionalCopiesQuantityOptions: additionalCopiesQuantity })
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.include("Delivery details - Order a certificate - GOV.UK");
            chai.expect(patchCertificateItemStub.calledOnce).to.be.true;
            chai.expect(certificateDetails.quantity).to.equal(expectedQuantity);
        });
    });
});
