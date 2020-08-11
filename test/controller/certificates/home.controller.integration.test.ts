import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import { ROOT_CERTIFICATE, replaceCompanyNumber } from "../../../src/model/page.urls";
import { CompanyProfile } from "ch-sdk-node/dist/services/company-profile";
import Resource from "ch-sdk-node/dist/services/resource";
import CompanyProfileService from "ch-sdk-node/dist/services/company-profile/service";

const COMPANY_NUMBER = "00000000";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyProfileStub;

const dummyCompanyProfileAcceptableCompanyType: Resource<CompanyProfile> = {
    httpStatusCode: 200,
    resource: {
        companyName: "company name",
        companyNumber: "00000000",
        companyStatus: "active",
        companyStatusDetail: "company status detail",
        dateOfCreation: "date of creation",
        jurisdiction: "jurisdiction",
        sicCodes: ["85100", "85200"],
        hasBeenLiquidated: false,
        type: "ltd",
        hasCharges: false,
        hasInsolvencyHistory: false,
        registeredOfficeAddress: {
            addressLineOne: "line1",
            addressLineTwo: "line2",
            careOf: "careOf",
            country: "uk",
            locality: "locality",
            poBox: "123",
            postalCode: "post code",
            premises: "premises",
            region: "region"
        },
        accounts: {
            nextAccounts: {
                periodEndOn: "2019-10-10",
                periodStartOn: "2019-01-01"
            },
            nextDue: "2020-05-31",
            overdue: false
        },
        confirmationStatement: {
            nextDue: "2020-05-31",
            overdue: false
        },
        links: {
            filingHistory: "/company/00000000/filing-history"
        }
    }
};

const dummyCompanyProfileNotAcceptableCompanyType: Resource<CompanyProfile> = {
    httpStatusCode: 200,
    resource: {
        companyName: "company name",
        companyNumber: "00000000",
        companyStatus: "active",
        companyStatusDetail: "company status detail",
        dateOfCreation: "date of creation",
        jurisdiction: "jurisdiction",
        sicCodes: ["85100", "85200"],
        hasBeenLiquidated: false,
        type: "other",
        hasCharges: false,
        hasInsolvencyHistory: false,
        registeredOfficeAddress: {
            addressLineOne: "line1",
            addressLineTwo: "line2",
            careOf: "careOf",
            country: "uk",
            locality: "locality",
            poBox: "123",
            postalCode: "post code",
            premises: "premises",
            region: "region"
        },
        accounts: {
            nextAccounts: {
                periodEndOn: "2019-10-10",
                periodStartOn: "2019-01-01"
            },
            nextDue: "2020-05-31",
            overdue: false
        },
        confirmationStatement: {
            nextDue: "2020-05-31",
            overdue: false
        },
        links: {
            filingHistory: "/company/00000000/filing-history"
        }
    }
};

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
