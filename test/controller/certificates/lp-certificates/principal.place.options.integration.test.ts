import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../../__mocks__/redis.mocks";
import { getAppWithMockedCsrf } from '../../../__mocks__/csrf.mocks';
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../../src/client/api.client";
import { LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS, replaceCertificateId } from "../../../../src/model/page.urls";
import { PrincipalPlaceOfBusinessOptionName } from "../../../../src/controllers/certificates/lp-certificates/PrincipalPlaceOfBusinessOptionName";
import { PRINCIPAL_PLACE_OPTION_NOT_SELECTED } from "../../../../src/model/error.messages";
import { AddressRecordsType } from "../../../../src/model/AddressRecordsType";

const CERTIFICATE_ID = "CRT-000000-000000";

const PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL =
    replaceCertificateId(LP_CERTIFICATE_PRINCIPAL_PLACE_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp: null = null;
let getCertificateItemStub;
let patchCertificateItemStub;
let getBasketStub;

describe("place.of.business.options.integration.test", () => {
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
        itemOptions: {
            forename: "john",
            surname: "smith"
        }
    } as CertificateItem;

    const certificateItemWithCurrent = {
        itemOptions: {
            principalPlaceOfBusinessDetails: {
                includeAddressRecordsType: AddressRecordsType.CURRENT
            }
        }
    } as CertificateItem;

    const certificateItemWithCurrentAndOnePrevious = {
        itemOptions: {
            principalPlaceOfBusinessDetails: {
                includeAddressRecordsType: AddressRecordsType.CURRENT_AND_PREVIOUS
            }
        }
    } as CertificateItem;

    const certificateItemWithCurrentPreviousAndPrior = {
        itemOptions: {
            principalPlaceOfBusinessDetails: {
                includeAddressRecordsType: AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR
            }
        }
    } as CertificateItem;

    const certificateItemWithAll = {
        itemOptions: {
            principalPlaceOfBusinessDetails: {
                includeAddressRecordsType: AddressRecordsType.ALL
            }
        }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the place of business options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("What principal place of business information do you need?");
            chai.expect($("head title").text().trim()).to.equal("Principal place of business options - Order a certificate - GOV.UK");
        });

        it("renders the full place of business options page if full layout requested", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose from the full list of principal places of business");
            chai.expect($("head title").text().trim()).to.equal("Full list of principal place of business options - Order a certificate - GOV.UK");
        });

        it("renders the place of business options page with current address selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithCurrent));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("What principal place of business information do you need?");
            chai.expect($("head title").text().trim()).to.equal("Principal place of business options - Order a certificate - GOV.UK");
            chai.expect($("#principal-place-of-business").attr("checked")).to.equal("checked");
        });

        it("renders the place of business options page with current address selected if option on full page selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithAll));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("What principal place of business information do you need?");
            chai.expect($("head title").text().trim()).to.equal("Principal place of business options - Order a certificate - GOV.UK");
            chai.expect($("#principal-place-of-business").attr("checked")).to.equal("checked");
        });

        it("renders the place of business options page with current address and one previous selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithCurrentAndOnePrevious));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("What principal place of business information do you need?");
            chai.expect($("head title").text().trim()).to.equal("Principal place of business options - Order a certificate - GOV.UK");
            chai.expect($("#principal-place-of-business-2").attr("checked")).to.equal("checked");
        });

        it("renders the full place of business options page with current address selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithCurrent));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose from the full list of principal places of business");
            chai.expect($("head title").text().trim()).to.equal("Full list of principal place of business options - Order a certificate - GOV.UK");
            chai.expect($("#principal-place-of-business").attr("checked")).to.equal("checked");
        });

        it("renders the full place of business options page with current address and one previous selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithCurrentAndOnePrevious));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose from the full list of principal places of business");
            chai.expect($("head title").text().trim()).to.equal("Full list of principal place of business options - Order a certificate - GOV.UK");
            chai.expect($("#principal-place-of-business-2").attr("checked")).to.equal("checked");
        });

        it("renders the full place of business options page with current address and two previous selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithCurrentPreviousAndPrior));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose from the full list of principal places of business");
            chai.expect($("head title").text().trim()).to.equal("Full list of principal place of business options - Order a certificate - GOV.UK");
            chai.expect($("#principal-place-of-business-3").attr("checked")).to.equal("checked");
        });

        it("renders the full place of business options page with all selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithAll));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose from the full list of principal places of business");
            chai.expect($("head title").text().trim()).to.equal("Full list of principal place of business options - Order a certificate - GOV.UK");
            chai.expect($("#principal-place-of-business-4").attr("checked")).to.equal("checked");
        });
    });

    describe("place of business options post", () => {
        it("redirects the user to the delivery-details page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    principalPlace: PrincipalPlaceOfBusinessOptionName.CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to delivery-options");
        });

        it("throws a validation error when no option selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(PRINCIPAL_PLACE_OF_BUSINESS_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send();

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(PRINCIPAL_PLACE_OPTION_NOT_SELECTED);
        });
    });
});
