import sinon from "sinon";
import ioredis from "ioredis";
import { ROOT_CERTIFIED_COPY, replaceCompanyNumber, START_BUTTON_PATH_SUFFIX } from "../../../src/model/page.urls";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import * as apiClient from "../../../src/client/api.client";
import {
    SIGNED_IN_COOKIE,
    signedInSession
} from "../../__mocks__/redis.mocks";
import { getDummyBasket } from "../../utils/basket.utils.test";
import { BASKET_ITEM_LIMIT } from "../../../src/config/config";
import cheerio from "cheerio";
import { getAppWithMockedCsrf } from '../../__mocks__/csrf.mocks';

import * as chai from "chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);

const COMPANY_NUMBER = "00000000";
const sandbox = sinon.createSandbox();
let testApp: null = null;
let getCompanyProfileStub;
let dummyCompanyProfile: any;
let getBasketStub;

describe("certified-copy.home.controller.integration", () => {
    before(() => {
        // set default for configurable banner once for the suite
        process.env.CONFIGURABLE_BANNER_ENABLED = "false";
    });

    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").resolves();
        sandbox.stub(ioredis.prototype, "get").resolves(signedInSession);
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

        testApp = getAppWithMockedCsrf(sandbox);
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("renders the start page as company has a filing history link", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);
        getBasketStub = sandbox.stub(apiClient, "getBasket")
            .resolves({ enrolled: true });

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Order a certified document");
    });

    describe("configurable banner behavior", () => {
        const scenarios = [
            {
                name: "enabled=true, title and text present",
                env: { CONFIGURABLE_BANNER_ENABLED: "true", CONFIGURABLE_BANNER_TITLE: "Configurable banner title", CONFIGURABLE_BANNER_TEXT: "This is configured banner text." },
                expectBannerShown: true
            },
            {
                name: "enabled=false, title and text present",
                env: { CONFIGURABLE_BANNER_ENABLED: "false", CONFIGURABLE_BANNER_TITLE: "Configurable banner title", CONFIGURABLE_BANNER_TEXT: "This is configured banner text." },
                expectBannerShown: false
            },
            {
                name: "enabled=true, title empty, text present",
                env: { CONFIGURABLE_BANNER_ENABLED: "true", CONFIGURABLE_BANNER_TITLE: "", CONFIGURABLE_BANNER_TEXT: "This is configured banner text." },
                expectBannerShown: false
            },
            {
                name: "enabled=true, title present, text empty",
                env: { CONFIGURABLE_BANNER_ENABLED: "true", CONFIGURABLE_BANNER_TITLE: "Configurable banner title", CONFIGURABLE_BANNER_TEXT: "" },
                expectBannerShown: false
            },
            {
                name: "enabled=TRUE (uppercase), title and text present",
                env: { CONFIGURABLE_BANNER_ENABLED: "TRUE", CONFIGURABLE_BANNER_TITLE: "Configurable banner title", CONFIGURABLE_BANNER_TEXT: "This is configured banner text." },
                expectBannerShown: false
            },
            {
                name: "enabled unset (deleted), title and text present",
                env: { CONFIGURABLE_BANNER_ENABLED: undefined, CONFIGURABLE_BANNER_TITLE: "Configurable banner title", CONFIGURABLE_BANNER_TEXT: "This is configured banner text." },
                expectBannerShown: false
            }
        ];

        scenarios.forEach((scenario) => {
            describe(scenario.name, () => {
                let _oldConfigurableBannerEnabled: string | undefined;
                let _oldConfigurableBannerTitle: string | undefined;
                let _oldConfigurableBannerText: string | undefined;

                before(() => {
                    // save current env vars so we can restore them later
                    _oldConfigurableBannerEnabled = process.env.CONFIGURABLE_BANNER_ENABLED;
                    _oldConfigurableBannerTitle = process.env.CONFIGURABLE_BANNER_TITLE;
                    _oldConfigurableBannerText = process.env.CONFIGURABLE_BANNER_TEXT;

                    // apply scenario envs
                    if (scenario.env.CONFIGURABLE_BANNER_ENABLED === undefined) {
                        delete process.env.CONFIGURABLE_BANNER_ENABLED;
                    } else {
                        process.env.CONFIGURABLE_BANNER_ENABLED = scenario.env.CONFIGURABLE_BANNER_ENABLED as string;
                    }
                    process.env.CONFIGURABLE_BANNER_TITLE = scenario.env.CONFIGURABLE_BANNER_TITLE as string;
                    process.env.CONFIGURABLE_BANNER_TEXT = scenario.env.CONFIGURABLE_BANNER_TEXT as string;
                });

                after(() => {
                    // restore env vars to previous values used elsewhere in the suite
                    process.env.CONFIGURABLE_BANNER_ENABLED = _oldConfigurableBannerEnabled;
                    process.env.CONFIGURABLE_BANNER_TITLE = _oldConfigurableBannerTitle;
                    process.env.CONFIGURABLE_BANNER_TEXT = _oldConfigurableBannerText;
                });

                beforeEach(() => {
                     // recreate the app after environment mutation so configuration that reads env vars during startup picks up the changes
                     testApp = getAppWithMockedCsrf(sandbox);
                 });

                it(`banner shown = ${scenario.expectBannerShown}`, async () => {
                    dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
                    getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
                        .resolves(dummyCompanyProfile);
                    // stub basket to be full so banner vs basket full behaviour is deterministic
                    sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT));

                    const resp = await chai.request(testApp)
                        .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER))
                        .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

                    chai.expect(resp.status).to.equal(200);

                    if (scenario.expectBannerShown) {
                        // configurable banner contents should be present
                        chai.expect(resp.text).to.contain(scenario.env.CONFIGURABLE_BANNER_TITLE as string);
                        chai.expect(resp.text).to.contain(scenario.env.CONFIGURABLE_BANNER_TEXT as string);
                        // the basket full banner should not be shown
                        chai.expect(resp.text).to.not.contain("Your basket is full");
                    } else {
                        // banner not shown; basket full message should be present
                        chai.expect(resp.text).to.contain("Your basket is full");
                        chai.expect(resp.text).to.contain(
                            `You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
                    }
                });
            });
        });
    });

    it("does not render the start now page as company has no filing history link", async () => {
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("does not render the start now page if company type is uk establishment and has a filing history link", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        dummyCompanyProfile.resource.type = "uk-establishment";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("You cannot order a certificate or certified document for this company. ");
    });

    it("renders `This order will be for...` message when no basket link is shown", async () => {
        process.env.CONFIGURABLE_BANNER_ENABLED = "false";
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Sign in / Register");
        chai.expect(resp.text).to.contain("This order will be for company name (00000000)");
        verifyStartButtonEnabledStateIs(resp.text, true);
    });

    it("renders `This order will be for...` message when items below the limit", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT - 1));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER))
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT - 1})`);
        chai.expect(resp.text).to.contain("This order will be for company name (00000000)");
        verifyStartButtonEnabledStateIs(resp.text, true);
    });

    it("renders `Your basket is full...` warning when items at the limit", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER))
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT})`);
        chai.expect(resp.text).to.contain(`Your basket is full`);
        chai.expect(resp.text).to.contain(`You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
        chai.expect(resp.text).to.contain(`To add more, you'll need to remove some items first.`);
        verifyStartButtonEnabledStateIs(resp.text, true);
    });

    it("renders `Your basket is full...` warning when items over the limit", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT + 1));

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER))
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT + 1})`);
        chai.expect(resp.text).to.contain(`Your basket is full`);
        chai.expect(resp.text).to.contain(`You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
        chai.expect(resp.text).to.contain(`To add more, you'll need to remove some items first.`);
        verifyStartButtonEnabledStateIs(resp.text, true);
    });

    it("renders `There is a problem...` error, disables button when items at the limit and re-referred back to page", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT));

        const url : string = replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER) + START_BUTTON_PATH_SUFFIX;

        const resp = await chai.request(testApp)
            .get(url)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT})`);
        chai.expect(resp.text).to.contain(`There is a problem`);
        chai.expect(resp.text).to.contain(`Your basket is full. To add more to your order, you&#39;ll need to remove some items first.`);
        verifyStartButtonEnabledStateIs(resp.text, false);
    });

    it("renders `There is a problem...` error, disables button when items over the limit and re-referred back to page", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT + 1));

        const url : string = replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER) + START_BUTTON_PATH_SUFFIX;

        const resp = await chai.request(testApp)
            .get(url)
            .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain(`Basket (${BASKET_ITEM_LIMIT + 1})`);
        chai.expect(resp.text).to.contain(`There is a problem`);
        chai.expect(resp.text).to.contain(`Your basket is full. To add more to your order, you&#39;ll need to remove some items first.`);
        verifyStartButtonEnabledStateIs(resp.text, false);
    });

const verifyStartButtonEnabledStateIs = (responseText: string, isEnabled: boolean) => {
    const page = cheerio.load(responseText)
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
}

});
