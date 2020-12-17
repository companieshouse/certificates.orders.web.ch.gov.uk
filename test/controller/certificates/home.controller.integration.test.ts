import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { ROOT_CERTIFICATE, replaceCompanyNumber } from "../../../src/model/page.urls";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import { dummyCompanyProfileAcceptableCompanyType, dummyCompanyProfileNotAcceptableCompanyType } from "../../__mocks__/company.profile.mocks";

import {
    mockNotAcceptableDissolvedCompanyLimitedPartnershipProfile,
    mockAcceptableNonDissolvedCompanyProfile,
    mockAcceptableDissolvedCompanyProfile,
    mockCompanyProfileConfiguration
} from "../../__mocks__/certificates.mocks";

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
            .returns(Promise.resolve(mockAcceptableNonDissolvedCompanyProfile));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Use this service to order a signed certificate of incorporation for a company, including all company name changes.");
        chai.expect(resp.text).to.contain("statement of good standing");
        chai.expect(resp.text).to.contain("registered office address");
        chai.expect(resp.text).to.contain("directors");
        chai.expect(resp.text).to.contain("secretaries");
        chai.expect(resp.text).to.contain("company objects");
    });

    it("does not render the start page for dissolved company type that is not allowed to order a certificate", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(mockNotAcceptableDissolvedCompanyLimitedPartnershipProfile));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });
});
