import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { ROOT_CERTIFICATE, replaceCompanyNumber } from "../../../src/model/page.urls";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import { dummyCompanyProfileAcceptableCompanyType, dummyCompanyProfileNotAcceptableCompanyType } from "../../__mocks__/company.profile.mocks";

import {
    mockNotAcceptableDissolvedCompanyLimitedPartnershipProfile,
    getMockCompanyProfile,
    mockAcceptableDissolvedCompanyProfile,
    mockCompanyProfileConfiguration
} from "../../__mocks__/certificates.mocks";
import { FEATURE_FLAGS } from "../../../src/config/FeatureFlags";
import cheerio from "cheerio";

const COMPANY_NUMBER = "00000000";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyProfileStub;

describe("certificate.home.controller.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());

        testApp = require("../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("renders the start page if company type is allowed to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfileAcceptableCompanyType));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Order a certificate");
    });

    it("displays the notification banner with the in context company name and company number", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfileAcceptableCompanyType));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("This order will be for company name (00000000)");
    });

    it("does not render the start page if company type is not allowed to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfileNotAcceptableCompanyType));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("renders the start page for dissolved company type that is allowed to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(mockAcceptableDissolvedCompanyProfile));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate of dissolution for a company, including all company name changes.");
        chai.expect(resp.text).not.to.contain("statement of good standing");
        chai.expect(resp.text).not.to.contain("registered office address");
        chai.expect(resp.text).not.to.contain("directors");
        chai.expect(resp.text).not.to.contain("secretaries");
        chai.expect(resp.text).not.to.contain("company objects");
    });

    it("renders the start page for allowed active company to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(getMockCompanyProfile()));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate of incorporation for a company, including all company name changes.");
        chai.expect(resp.text).to.contain("statement of good standing");
        chai.expect(resp.text).to.contain("registered office address");
        chai.expect(resp.text).to.contain("directors");
        chai.expect(resp.text).to.contain("secretaries");
        chai.expect(resp.text).to.contain("company objects");
        chai.expect(resp.text).to.not.contain("details of liquidators");
        chai.expect(resp.text).to.not.contain("details of administrators");
    });

    it("renders the start page for active llp company to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(getMockCompanyProfile({companyType: "llp", companyStatus: "active"})));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate of incorporation for a company, including all company name changes.");
        chai.expect(resp.text).to.contain("statement of good standing");
        chai.expect(resp.text).to.contain("registered office address");
        chai.expect(resp.text).to.contain("designated members");
        chai.expect(resp.text).to.contain("members");
        chai.expect(resp.text).to.not.contain("details of liquidators");
        chai.expect(resp.text).to.not.contain("details of administrators");
    });

    it("renders the start page for limited company in liquidation to order a certificate if feature flag enabled", async () => {
        FEATURE_FLAGS.liquidatedCompanyCertificateEnabled = true;
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(getMockCompanyProfile({companyType: "ltd", companyStatus: "liquidation"})));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate of incorporation for a company, including all company name changes.");
        chai.expect(resp.text).to.not.contain("statement of good standing");
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
            .returns(Promise.resolve(getMockCompanyProfile({companyType: "llp", companyStatus: "liquidation"})));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate of incorporation for a company, including all company name changes.");
        chai.expect(resp.text).to.not.contain("statement of good standing");
        chai.expect(resp.text).to.contain("registered office address");
        chai.expect(resp.text).to.contain("designated members");
        chai.expect(resp.text).to.contain("members");
        chai.expect(resp.text).to.contain("details of liquidators");
        chai.expect(resp.text).to.not.contain("details of administrators");
    });

    it("does not render the start page for company in liquidation if feature flag disabled", async () => {
        FEATURE_FLAGS.liquidatedCompanyCertificateEnabled = false;
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(getMockCompanyProfile({companyType: "ltd", companyStatus: "liquidation"})));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("does not render the start page for dissolved company type that is not allowed to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(mockNotAcceptableDissolvedCompanyLimitedPartnershipProfile));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("renders the start page for limited company in administration to order a certificate if feature flag enabled", async () => {
        FEATURE_FLAGS.administrationCompanyCertificateEnabled = true;
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(getMockCompanyProfile({companyType: "ltd", companyStatus: "administration"})));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate of incorporation for a company, including all company name changes.");
        chai.expect(resp.text).to.not.contain("statement of good standing");
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
            .returns(Promise.resolve(getMockCompanyProfile({companyType: "llp", companyStatus: "administration"})));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate of incorporation for a company, including all company name changes.");
        chai.expect(resp.text).to.not.contain("statement of good standing");
        chai.expect(resp.text).to.contain("registered office address");
        chai.expect(resp.text).to.contain("designated members");
        chai.expect(resp.text).to.contain("members");
        chai.expect(resp.text).to.not.contain("details of liquidators");
        chai.expect(resp.text).to.contain("details of administrators");
    });

    it("does not render the start page for company in administration if feature flag disabled", async () => {
        FEATURE_FLAGS.administrationCompanyCertificateEnabled = false;
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(getMockCompanyProfile({companyType: "ltd", companyStatus: "administration"})));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("renders the correct start now button URL for an active company", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfileAcceptableCompanyType));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);

        const $ = cheerio.load(resp.text);
        chai.expect($(".govuk-button--start").attr("href")).to.equal("/company/00000000/orderable/certificates/certificate-type");
    });

    it("renders the correct start now button URL for a dissolved company", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(mockAcceptableDissolvedCompanyProfile));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);

        const $ = cheerio.load(resp.text);
        chai.expect($(".govuk-button--start").attr("href")).to.equal("/company/00000000/orderable/dissolved-certificates/certificate-type");
    });
});
