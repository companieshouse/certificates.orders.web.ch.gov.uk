import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import cheerio from "cheerio";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import * as apiClient from "../../../src/client/api.client";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import {
    CERTIFICATE_DELIVERY_OPTIONS,
    replaceCertificateId,
    CERTIFICATE_EMAIL_OPTIONS,
    DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS
} from "../../../src/model/page.urls";

const CERTIFICATE_ID = "CRT-000000-000000";
const DELIVERY_OPTION_NOT_SELECTED = "Select a delivery option";
const DELIVERY_OPTIONS_URL =
    replaceCertificateId(CERTIFICATE_DELIVERY_OPTIONS, CERTIFICATE_ID);
const DISSOLVED_DELIVERY_OPTIONS_URL =
    replaceCertificateId(DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS, CERTIFICATE_ID);
const sandbox = sinon.createSandbox();
let testApp = null;
let getCertificateItemStub;
let patchCertificateItemStub;
let getBasketStub;

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

    const certificateItem = {
        itemOptions: {
            forename: "john",
            surname: "smith"
        }
    } as CertificateItem;

    describe("Check the page renders", () => {
        it("renders the delivery options page", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose a delivery option");
        });

        it("renders the delivery options page for a dissolved company", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(DISSOLVED_DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($("h1").text().trim()).to.equal("Choose a delivery option");
        });
    });

    describe("delivery options validation", () => {
        it("throws a validation error when no option selected", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

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
            const certificateDetails = {
                itemOptions: {
                    deliveryTimescale: "standard"
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));

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
        it("redirects the user to the email-options page", async () => {
            const certificateDetails = {
                itemOptions: {
                    deliveryTimescale: "same-day"
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));
            patchCertificateItemStub = sandbox.stub(apiClient, "patchCertificateItem")
                .returns(Promise.resolve(certificateDetails));

            const resp = await chai.request(testApp)
                .post(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0)
                .send({
                    deliveryOptions: "same-day"
                });

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to email-options");
        });
    });

    describe("delivery options back button", () => {
        it("back button takes the user to the certificate options page if they have not selected any options", async () => {
            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("certificate-options");
        });

        it("back button takes the user to the registered office options page if they selected only the registered office option", async () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("registered-office-options");
        });

        it("back button takes the user to the director options page if they selected only the director options", async () => {
            const certificateItem = {
                itemOptions: {
                    directorDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("director-options");
        });

        it("back button takes the user to the secretary options page if they selected only the secretary options", async () => {
            const certificateItem = {
                itemOptions: {
                    secretaryDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("secretary-options");
        });

        it("back button takes the user to the director options page if they selected both the director options and registered office options", async () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    directorDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("director-options");
        });

        it("back button takes the user to the secretary options page if they selected the director, secretary and registered office options", async () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    directorDetails: {
                        includeBasicInformation: true
                    },
                    secretaryDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("secretary-options");
        });

        it("back button takes the user to the registered office options page if they selected only the registered office option", async () => {
            const basketDetails = {} as Basket;
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("registered-office-options");
        });

        it("back button takes the user to the designated members options page if they selected only the designated members options", async () => {
            const basketDetails = {} as Basket;
            const certificateItem = {
                itemOptions: {
                    designatedMemberDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("designated-members-options");
        });

        it("back button takes the user to the members options page if they selected only the members options", async () => {
            const basketDetails = {} as Basket;
            const certificateItem = {
                itemOptions: {
                    memberDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("members-options");
        });

        it("back button takes the user to the designated members options page if they selected both the designated members options and registered office options", async () => {
            const basketDetails = {} as Basket;
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    designatedMemberDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("designated-members-options");
        });

        it("back button takes the user to the members options page if they selected the designated members, members and registered office options", async () => {
            const basketDetails = {} as Basket;
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    },
                    designatedMemberDetails: {
                        includeBasicInformation: true
                    },
                    memberDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateItem));
            getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(basketDetails));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            const $ = cheerio.load(resp.text);

            chai.expect(resp.status).to.equal(200);
            chai.expect($(".govuk-back-link").attr("href")).to.include("members-options");
        });
    
            it("back button takes the user to the place of business options page if they selected only the place of business option", async () => {
                const basketDetails = {} as Basket;
                const certificateItem = {
                    itemOptions: {
                        principalPlaceOfBusinessDetails: {
                            includeAddressRecordsType: "current"
                        }
                    }
                } as CertificateItem;
    
                getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                    .returns(Promise.resolve(certificateItem));
                getBasketStub = sandbox.stub(apiClient, "getBasket").returns(Promise.resolve(basketDetails));
    
                const resp = await chai.request(testApp)
                    .get(DELIVERY_OPTIONS_URL)
                    .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);
    
                const $ = cheerio.load(resp.text);
    
                chai.expect(resp.status).to.equal(200);
                chai.expect($(".govuk-back-link").attr("href")).to.include("principal-place-of-business-options");
            });
        });
    });

    describe("delivery option checked", () => {
        it("displays checked option", async () => {
            const certificateDetails = {
                itemOptions: {
                    deliveryTimescale: "same-day"
                }
            } as CertificateItem;

            getCertificateItemStub = sandbox.stub(apiClient, "getCertificateItem")
                .returns(Promise.resolve(certificateDetails));

            const resp = await chai.request(testApp)
                .get(DELIVERY_OPTIONS_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.include(`<input class="govuk-radios__input" id="deliveryOptions" name="deliveryOptions" type="radio" value="same-day" checked aria-describedby="deliveryOptions-item-hint" data-event-id="express-delivery">`);
        });
    });
});
