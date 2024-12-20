import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../../__mocks__/redis.mocks";
import { getAppWithMockedCsrf } from '../../../__mocks__/csrf.mocks';
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../../src/client/api.client";
import { LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS, replaceCertificateId } from "../../../../src/model/page.urls";
import { RegisteredOfficeAddressOptionName } from "../../../../src/controllers/certificates/llp-certificates/RegisteredOfficeAddressOptionName";
import { REGISTERED_OFFICE_OPTION_NOT_SELECTED } from "../../../../src/model/error.messages";
import { AddressRecordsType } from "../../../../src/model/AddressRecordsType";

const CERTIFICATE_ID = "CRT-000000-000000";

const REGISTERED_OFFICE_OPTIONS_URL =
    replaceCertificateId(LLP_CERTIFICATE_REGISTERED_OFFICE_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;
let getBasketStub;

describe("registered.office.options.integration.test", () => {
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
            registeredOfficeAddressDetails: {
                includeAddressRecordsType: AddressRecordsType.CURRENT
            }
        }
    } as CertificateItem;

    const certificateItemWithCurrentAndOnePrevious = {
        itemOptions: {
            registeredOfficeAddressDetails: {
                includeAddressRecordsType: AddressRecordsType.CURRENT_AND_PREVIOUS
            }
        }
    } as CertificateItem;

    const certificateItemWithCurrentPreviousAndPrior = {
        itemOptions: {
            registeredOfficeAddressDetails: {
                includeAddressRecordsType: AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR
            }
        }
    } as CertificateItem;

    const certificateItemWithAll = {
        itemOptions: {
            registeredOfficeAddressDetails: {
                includeAddressRecordsType: AddressRecordsType.ALL
            }
        }
    } as CertificateItem;

    const patchedCertificateItem = {
        itemOptions: {
            forename: "john",
            surname: "smith",
            designatedMemberDetails: {
                includeBasicInformation: true
            }
        }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the registered office options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("What registered office address information do you need?");
            chai.expect($("title").text().trim()).to.equal("Registered office options - Order a certificate - GOV.UK");
        });

        it("renders the full registered office options page if full layout requested", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(REGISTERED_OFFICE_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose from the full list of registered office addresses");
            chai.expect($("title").text().trim()).to.equal("Full list of registered office options - Order a certificate - GOV.UK");
        });

        it("renders the registered office options page with current address selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithCurrent));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("What registered office address information do you need?");
            chai.expect($("title").text().trim()).to.equal("Registered office options - Order a certificate - GOV.UK");
            chai.expect($("#registered-office").attr("checked")).to.equal("checked");
        });

        it("renders the registered office options page with current address selected if option on full page selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithAll));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("What registered office address information do you need?");
            chai.expect($("title").text().trim()).to.equal("Registered office options - Order a certificate - GOV.UK");
            chai.expect($("#registered-office").attr("checked")).to.equal("checked");
        });

        it("renders the registered office options page with current address and one previous selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithCurrentAndOnePrevious));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("What registered office address information do you need?");
            chai.expect($("title").text().trim()).to.equal("Registered office options - Order a certificate - GOV.UK");
            chai.expect($("#registered-office-2").attr("checked")).to.equal("checked");
        });

        it("renders the full registered office options page with current address selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithCurrent));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(REGISTERED_OFFICE_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose from the full list of registered office addresses");
            chai.expect($("title").text().trim()).to.equal("Full list of registered office options - Order a certificate - GOV.UK");
            chai.expect($("#registered-office").attr("checked")).to.equal("checked");
        });

        it("renders the full registered office options page with current address and one previous selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithCurrentAndOnePrevious));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(REGISTERED_OFFICE_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose from the full list of registered office addresses");
            chai.expect($("title").text().trim()).to.equal("Full list of registered office options - Order a certificate - GOV.UK");
            chai.expect($("#registered-office-2").attr("checked")).to.equal("checked");
        });

        it("renders the full registered office options page with current address and two previous selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithCurrentPreviousAndPrior));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(REGISTERED_OFFICE_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose from the full list of registered office addresses");
            chai.expect($("title").text().trim()).to.equal("Full list of registered office options - Order a certificate - GOV.UK");
            chai.expect($("#registered-office-3").attr("checked")).to.equal("checked");
        });

        it("renders the full registered office options page with all selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItemWithAll));
            getBasketStub = sandbox.stub(apiClient, "getBasket")
                .returns(Promise.resolve({ enrolled: true }));

            const resp = await chai.request(testApp)
                .get(REGISTERED_OFFICE_OPTIONS_URL + "?layout=full")
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose from the full list of registered office addresses");
            chai.expect($("title").text().trim()).to.equal("Full list of registered office options - Order a certificate - GOV.UK");
            chai.expect($("#registered-office-4").attr("checked")).to.equal("checked");
        });
    });

    describe("registered office options post", () => {
        it("redirects the user to the delivery-details page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    registeredOffice: RegisteredOfficeAddressOptionName.CURRENT_ADDRESS_AND_THE_ONE_PREVIOUS
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to delivery-options");
        });

        it("redirects the user to the designated-members-options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(patchedCertificateItem));

            const resp = await chai.request(testApp)
                .post(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    registeredOffice: RegisteredOfficeAddressOptionName.CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to designated-members-options");
        });

        it("redirects the user to the members-options page when the members option is selected", async () => {
            const membersCertificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith",
                    memberDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(membersCertificateItem));

            const resp = await chai.request(testApp)
                .post(REGISTERED_OFFICE_OPTIONS_URL)
                .redirects(0)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .send({
                    registeredOffice: RegisteredOfficeAddressOptionName.CURRENT_ADDRESS_AND_THE_TWO_PREVIOUS
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.contain("Found. Redirecting to members-options");
        });

        it("throws a validation error when no option selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .post(REGISTERED_OFFICE_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send();

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(REGISTERED_OFFICE_OPTION_NOT_SELECTED);
        });
    });
});
