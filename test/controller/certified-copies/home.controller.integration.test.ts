const chai = require("chai")
import sinon from "sinon";
import ioredis from "ioredis";
import { ROOT_CERTIFIED_COPY, replaceCompanyNumber } from "../../../src/model/page.urls";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";

const COMPANY_NUMBER = "00000000";

const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyProfileStub;
let dummyCompanyProfile;

describe("certified-copy.home.controller.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        dummyCompanyProfile = {
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
                }
            }
        };

        testApp = require("../../../src/app").default;
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("renders the start page as company has a filing history link", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfile));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Order a certified document");
    });

    it("displays the notification banner with the in context company name and company number", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfile));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("This order will be for company name (00000000)");
    });

    it("does not render the start now page as company has no filing history link", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfile));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("does not render the start now page if company type is uk establishment and has a filing history link", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        dummyCompanyProfile.resource.type = "uk-establishment";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .returns(Promise.resolve(dummyCompanyProfile));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });
});
