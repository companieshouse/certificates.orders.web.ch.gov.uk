import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";
import { SIGNED_OUT_COOKIE, signedOutSession } from "../../__mocks__/redis.mocks";
import { getAppWithMockedCsrf } from "../../__mocks__/csrf.mocks";
import { ROOT_CERTIFIED_COPY, replaceCompanyNumber, START_BUTTON_PATH_SUFFIX } from "../../../src/model/page.urls";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";

const COMPANY_NUMBER = "00006500";
const CERTIFIED_COPY_START_NOW_BUTTON_URL =
    replaceCompanyNumber(ROOT_CERTIFIED_COPY + START_BUTTON_PATH_SUFFIX, COMPANY_NUMBER);

const sandbox = sinon.createSandbox();
let testApp = null;
let dummyCompanyProfile;

describe("certified-copies.auth.start.now.middleware.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").resolves();
        sandbox.stub(ioredis.prototype, "get").resolves(signedOutSession);
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
        sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);

        testApp = getAppWithMockedCsrf(sandbox);
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("should not redirect " + ROOT_CERTIFIED_COPY + " to sign in if user is not logged in", async () => {
        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER))
            .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

        chai.expect(resp.redirects).to.be.empty;
    });

    it("should redirect " + ROOT_CERTIFIED_COPY + START_BUTTON_PATH_SUFFIX + " to sign in if user is not logged in",
        async () => {
            const resp = await chai.request(testApp)
                .get(replaceCompanyNumber(CERTIFIED_COPY_START_NOW_BUTTON_URL, COMPANY_NUMBER))
                .set("Cookie", [`__SID=${SIGNED_OUT_COOKIE}`]);

            chai.expect(resp.redirects[0]).to.include(`/signin?return_to=${CERTIFIED_COPY_START_NOW_BUTTON_URL}`);
        });
});
