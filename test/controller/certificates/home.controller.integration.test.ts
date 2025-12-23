import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import proxyquire from "proxyquire";

import {
    replaceCompanyNumber,
    ROOT_CERTIFICATE,
    ROOT_DISSOLVED_CERTIFICATE,
    START_BUTTON_PATH_SUFFIX
} from "../../../src/model/page.urls";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import { dummyCompanyProfileAcceptableCompanyType, dummyCompanyProfileNotAcceptableCompanyType } from "../../__mocks__/company.profile.mocks";

import {
    mockNotAcceptableDissolvedCompanyLimitedPartnershipProfile,
    getMockCompanyProfile,
    mockAcceptableDissolvedCompanyProfile,
    mockCompanyProfileConfiguration
} from "../../__mocks__/certificates.mocks";
import { getAppWithMockedCsrf } from "../../__mocks__/csrf.mocks";
import { FEATURE_FLAGS } from "../../../src/config/FeatureFlags";
import cheerio from "cheerio";
import { BASKET_ITEM_LIMIT } from "../../../src/config/config";
import { getDummyBasket } from "../../utils/basket.utils.test";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import * as apiClient from "../../../src/client/api.client";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { ApiResponse, ApiResult } from "@companieshouse/api-sdk-node/dist/services/resource";
import { success } from "@companieshouse/api-sdk-node/dist/services/result";
import BasketService from "@companieshouse/api-sdk-node/dist/services/order/basket/service";

const COMPANY_NUMBER = "00000000";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyProfileStub;

describe("certificate.home.controller.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").resolves();
        sandbox.stub(ioredis.prototype, "get").resolves(signedInSession);

        testApp = getAppWithMockedCsrf(sandbox);
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("renders the start page if company type is allowed to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfileAcceptableCompanyType);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Order a certificate");
    });

    it("displays the notification banner with the in context company name and company number", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfileAcceptableCompanyType);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
    });

    it("does not render the start page if company type is not allowed to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfileNotAcceptableCompanyType);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("renders the start page for dissolved company type that is allowed to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockAcceptableDissolvedCompanyProfile);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate of dissolution for a company, including all company name changes.");
        chai.expect(resp.text).not.to.contain("summary statement previously known as statement of good standing");
        chai.expect(resp.text).not.to.contain("registered office address");
        chai.expect(resp.text).not.to.contain("directors");
        chai.expect(resp.text).not.to.contain("secretaries");
        chai.expect(resp.text).not.to.contain("company objects");
    });

    it("renders the start page for allowed active company to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(getMockCompanyProfile());

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate for a company, including all company name changes.");
        chai.expect(resp.text).to.contain("a summary statement (this used to be known as statement of good standing)");
        chai.expect(resp.text).to.contain("the registered office address");
        chai.expect(resp.text).to.contain("company directors");
        chai.expect(resp.text).to.contain("company secretaries");
        chai.expect(resp.text).to.contain("company objects");
        chai.expect(resp.text).to.not.contain("details of liquidators");
        chai.expect(resp.text).to.not.contain("details of administrators");
    });

    it("renders the start page for active llp company to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(getMockCompanyProfile({ companyType: "llp", companyStatus: "active" }));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate for a company, including all company name changes.");
        chai.expect(resp.text).to.contain("a summary statement (this used to be known as statement of good standing)");
        chai.expect(resp.text).to.contain("registered office address");
        chai.expect(resp.text).to.contain("designated members");
        chai.expect(resp.text).to.contain("members");
        chai.expect(resp.text).to.not.contain("details of liquidators");
        chai.expect(resp.text).to.not.contain("details of administrators");
    });

    it("renders the start page for limited company in liquidation to order a certificate if feature flag enabled", async () => {
        FEATURE_FLAGS.liquidatedCompanyCertificateEnabled = true;
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(getMockCompanyProfile({ companyType: "ltd", companyStatus: "liquidation" }));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate for a company, including all company name changes.");
        chai.expect(resp.text).to.not.contain("summary statement previously known as statement of good standing");
        chai.expect(resp.text).to.contain("registered office address");
        chai.expect(resp.text).to.contain("directors");
        chai.expect(resp.text).to.contain("secretaries");
        chai.expect(resp.text).to.contain("company objects");
        chai.expect(resp.text).to.contain("details of liquidators");
        chai.expect(resp.text).to.not.contain("details of administrators");
    });

    it("renders the start page for an llp company in liquidation to order a certificate if feature flag enabled", async () => {
        FEATURE_FLAGS.liquidatedCompanyCertificateEnabled = true;
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(getMockCompanyProfile({ companyType: "llp", companyStatus: "liquidation" }));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate for a company, including all company name changes.");
        chai.expect(resp.text).to.not.contain("summary statement previously known as statement of good standing");
        chai.expect(resp.text).to.contain("registered office address");
        chai.expect(resp.text).to.contain("designated members");
        chai.expect(resp.text).to.contain("members");
        chai.expect(resp.text).to.contain("details of liquidators");
        chai.expect(resp.text).to.not.contain("details of administrators");
    });

    it("does not render the start page for company in liquidation if feature flag disabled", async () => {
        FEATURE_FLAGS.liquidatedCompanyCertificateEnabled = false;
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(getMockCompanyProfile({ companyType: "ltd", companyStatus: "liquidation" }));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("does not render the start page for dissolved company type that is not allowed to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockNotAcceptableDissolvedCompanyLimitedPartnershipProfile);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("renders the start page for limited company in administration to order a certificate if feature flag enabled", async () => {
        FEATURE_FLAGS.administrationCompanyCertificateEnabled = true;
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(getMockCompanyProfile({ companyType: "ltd", companyStatus: "administration" }));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate for a company, including all company name changes.");
        chai.expect(resp.text).to.not.contain("summary statement previously known as statement of good standing");
        chai.expect(resp.text).to.contain("registered office address");
        chai.expect(resp.text).to.contain("directors");
        chai.expect(resp.text).to.contain("secretaries");
        chai.expect(resp.text).to.contain("company objects");
        chai.expect(resp.text).to.not.contain("details of liquidators");
        chai.expect(resp.text).to.contain("details of administrators");
    });

    it("renders the start page for an llp company in administration to order a certificate if feature flag enabled", async () => {
        FEATURE_FLAGS.administrationCompanyCertificateEnabled = true;
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(getMockCompanyProfile({ companyType: "llp", companyStatus: "administration" }));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate for a company, including all company name changes.");
        chai.expect(resp.text).to.not.contain("summary statement previously known as statement of good standing");
        chai.expect(resp.text).to.contain("registered office address");
        chai.expect(resp.text).to.contain("designated members");
        chai.expect(resp.text).to.contain("members");
        chai.expect(resp.text).to.not.contain("details of liquidators");
        chai.expect(resp.text).to.contain("details of administrators");
    });

    it("does not render the start page for company in administration if feature flag disabled", async () => {
        FEATURE_FLAGS.administrationCompanyCertificateEnabled = false;
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(getMockCompanyProfile({ companyType: "ltd", companyStatus: "administration" }));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("renders the correct start now button URL for an active company", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfileAcceptableCompanyType);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);

        const $ = cheerio.load(resp.text);
        chai.expect($(".govuk-button--start").attr("href")).to.equal("/company/00000000/orderable/certificates/start");
    });

    it("renders the correct start now button URL for a dissolved company", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockAcceptableDissolvedCompanyProfile);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);

        const $ = cheerio.load(resp.text);
        chai.expect($(".govuk-button--start").attr("href")).to.equal("/company/00000000/orderable/dissolved-certificates/start");
    });

    it("renders `order a company certificate...` message when no basket link is shown", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockAcceptableDissolvedCompanyProfile);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Sign in / Register");
        verifyStartButtonEnabledStateIs(resp.text, true);
    });

    it("renders `order a company certificate...` message when items below the limit xx", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockAcceptableDissolvedCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT - 1));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber))
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT - 1})`);
        verifyStartButtonEnabledStateIs(resp.text, true);
    });

    it("renders `Your basket is full...` warning when items at the limit", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockAcceptableDissolvedCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber))
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT})`);
        chai.expect(resp.text).to.contain(`Your basket is full`);
        chai.expect(resp.text).to.contain(
            `You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
        chai.expect(resp.text).to.contain(`To add more, you'll need to remove some items first.`);
        verifyStartButtonEnabledStateIs(resp.text, true);
    });

    it("renders `Your basket is full...` warning when items over the limit", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockAcceptableDissolvedCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT + 1));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber))
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT + 1})`);
        chai.expect(resp.text).to.contain(`Your basket is full`);
        chai.expect(resp.text).to.contain(
            `You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
        chai.expect(resp.text).to.contain(`To add more, you'll need to remove some items first.`);
        verifyStartButtonEnabledStateIs(resp.text, true);
    });

    it("renders `There is a problem...` error, disables button when items at the limit and start now is clicked", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockAcceptableDissolvedCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT));

        const url : string = replaceCompanyNumber(ROOT_DISSOLVED_CERTIFICATE, COMPANY_NUMBER) + START_BUTTON_PATH_SUFFIX;

        const resp = await chai.request(testApp)
            .get(url)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT})`);
        chai.expect(resp.text).to.contain(`There is a problem`);
        chai.expect(resp.text).to.contain(`Your basket is full. To add more to your order, you&#39;ll need to remove some items first.`);
        verifyStartButtonEnabledStateIs(resp.text, false);
    });

    it("renders `There is a problem...` error, disables button when items over the limit and start now is clicked", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockAcceptableDissolvedCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT + 1));

        const url : string = replaceCompanyNumber(ROOT_DISSOLVED_CERTIFICATE, COMPANY_NUMBER) + START_BUTTON_PATH_SUFFIX;

        const resp = await chai.request(testApp)
            .get(url)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT + 1})`);
        chai.expect(resp.text).to.contain(`There is a problem`);
        chai.expect(resp.text).to.contain(`Your basket is full. To add more to your order, you&#39;ll need to remove some items first.`);
        verifyStartButtonEnabledStateIs(resp.text, false);
    });

    it("redirects to the next page when items below the limit and start now is clicked", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockAcceptableDissolvedCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT - 1));
        const certificateDetails = {
            id: "CRT-951616-000712",
            itemOptions: {
                companyStatus: "dissolved",
                certificateType: "incorporation-with-all-name-changes"
            }
        } as CertificateItem;
        const itemCreatedResponse: ApiResult<ApiResponse<CertificateItem>> = success({
            httpStatusCode: 201,
            resource: certificateDetails
        });
        sandbox.stub(apiClient, "postInitialCertificateItem").resolves(itemCreatedResponse);
        sandbox.stub(apiClient, "getCertificateItem").resolves(certificateDetails);

        const url : string = replaceCompanyNumber(ROOT_DISSOLVED_CERTIFICATE, COMPANY_NUMBER) + START_BUTTON_PATH_SUFFIX;

        const resp = await chai.request(testApp)
            .get(url)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        // Redirected-to page.
        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Choose a dispatch option");
    });

    it("renders `Sorry, there is a problem with the service` error & user nav bar if orders API is down", async () => {
        sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(mockAcceptableDissolvedCompanyProfile);
        sandbox.stub(BasketService.prototype, "getBasket").resolves({ httpStatusCode: 404 });

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, COMPANY_NUMBER))
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(404);
        chai.expect(resp.text).to.contain(`Sorry, there is a problem with the service`);
        verifyUserNavBarRenderedWithoutBasketLink(resp.text);
    });

    const verifyStartButtonEnabledStateIs = (responseText: string, isEnabled: boolean) => {
        const page = cheerio.load(responseText);
        const startNowButton = page(".govuk-button--start");
        chai.expect(startNowButton).to.exist;
        chai.expect(startNowButton.text()).to.contain("Start now");

        // The presence/absence of the href attribute (content) is what really determines whether the button (link)
        // is enabled or not.
        if (isEnabled) {
            chai.expect(startNowButton!.attr("href")).to.exist;
        } else {
            chai.expect(startNowButton!.attr("href")).to.not.exist;
        }
    };

    const verifyUserNavBarRenderedWithoutBasketLink = (responseText: string) => {
        chai.expect(responseText).to.not.contain(`Basket (`);
        chai.expect(responseText).to.contain(`test@testemail.com`);
        chai.expect(responseText).to.contain(`Your details`);
        chai.expect(responseText).to.contain(`Your filings`);
        chai.expect(responseText).to.contain(`Companies you follow`);
        chai.expect(responseText).to.contain(`Sign out`);
    };
});
