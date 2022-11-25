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
import * as HTMLParser from 'node-html-parser';

import * as chai from "chai";
import chaiHttp = require("chai-http");
chai.use(chaiHttp);

const COMPANY_NUMBER = "00000000";
const sandbox = sinon.createSandbox();
let testApp = null;
let getCompanyProfileStub;
let dummyCompanyProfile;
let getBasketStub;

describe("certified-copy.home.controller.integration", () => {
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
            .resolves(dummyCompanyProfile);
        getBasketStub = sandbox.stub(apiClient, "getBasket")
            .resolves({ enrolled: true });

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("Order a certified document");
    });

    it("displays the notification banner with the in context company name and company number", async () => {
        dummyCompanyProfile.resource.links.filingHistory = "/company/00000000/filing-history";
        getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
            .resolves(dummyCompanyProfile);

        const resp = await chai.request(testApp)
            .get(replaceCompanyNumber(ROOT_CERTIFIED_COPY, COMPANY_NUMBER));

        chai.expect(resp.status).to.equal(200);
        chai.expect(resp.text).to.contain("This order will be for company name (00000000)");
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
        chai.expect(resp.text).to.contain(
            `Your basket is full. You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
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
        chai.expect(resp.text).to.contain(
            `Your basket is full. You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
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
        chai.expect(resp.text).to.contain(`You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
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
        chai.expect(resp.text).to.contain(`You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
        verifyStartButtonEnabledStateIs(resp.text, false);
    });

const verifyStartButtonEnabledStateIs = (responseText: string, isEnabled: boolean) => {
    const page = HTMLParser.parse(responseText)
    const startNowButton = page.querySelector(".govuk-button--start");
    chai.expect(startNowButton).to.exist;
    chai.expect(startNowButton!.childNodes[0]!).to.exist;
    chai.expect(startNowButton!.childNodes[0]!.text).to.contain("Start now");

    // The presence/absence of the href attribute (content) is what really determines whether the button (link)
    // is enabled or not.
    if (isEnabled) {
        chai.expect(startNowButton!.rawAttributes.href).to.exist;
    } else {
        chai.expect(startNowButton!.rawAttributes.href).to.not.exist;
    }
}

});
