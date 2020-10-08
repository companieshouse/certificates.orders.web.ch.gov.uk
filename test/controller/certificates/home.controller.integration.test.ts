import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { ROOT_CERTIFICATE, replaceCompanyNumber } from "../../../src/model/page.urls";
import CompanyProfileService from "ch-sdk-node/dist/services/company-profile/service";
import { dummyCompanyProfileAcceptableCompanyType, dummyCompanyProfileNotAcceptableCompanyType } from "../../__mocks__/company.profile.mocks";

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
});
