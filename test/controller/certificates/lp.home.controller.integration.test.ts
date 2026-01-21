import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import {
    replaceCompanyNumber,
    LP_ROOT_CERTIFICATE,
    START_BUTTON_PATH_SUFFIX
} from "../../../src/model/page.urls";
import CompanyProfileService from "@companieshouse/api-sdk-node/dist/services/company-profile/service";
import { getAppWithMockedCsrf } from '../../__mocks__/csrf.mocks';
import cheerio from "cheerio";
import { BASKET_ITEM_LIMIT } from "../../../src/config/config";
import { getDummyBasket } from "../../utils/basket.utils.test";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import * as apiClient from "../../../src/client/api.client";
import { mockAcceptableDissolvedCompanyProfile, mockCompanyProfileConfiguration, getMockCompanyProfile } from "../../__mocks__/certificates.mocks";

import sinonChai from "sinon-chai";
import chaiHttp from "chai-http";
chai.use(chaiHttp);
chai.use(sinonChai);

const sandbox = sinon.createSandbox();
let testApp: any = null;
let getCompanyProfileStub: any;

describe("lp-certificates.home.controller.integration (configurable banner)", () => {
    beforeEach(() => {
        sandbox.stub(ioredis.prototype, "connect").resolves();
        sandbox.stub(ioredis.prototype, "get").resolves(signedInSession);
        // app creation will be done in scenario beforeEach after env is set
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

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
        }
    ];

    scenarios.forEach((scenario) => {
        describe(scenario.name, () => {
            let _oldConfigurableBannerEnabled: string | undefined;
            let _oldConfigurableBannerTitle: string | undefined;
            let _oldConfigurableBannerText: string | undefined;

            before(() => {
                _oldConfigurableBannerEnabled = process.env.CONFIGURABLE_BANNER_ENABLED;
                _oldConfigurableBannerTitle = process.env.CONFIGURABLE_BANNER_TITLE;
                _oldConfigurableBannerText = process.env.CONFIGURABLE_BANNER_TEXT;

                if (typeof scenario.env.CONFIGURABLE_BANNER_ENABLED === 'undefined') {
                    delete process.env.CONFIGURABLE_BANNER_ENABLED;
                } else {
                    process.env.CONFIGURABLE_BANNER_ENABLED = scenario.env.CONFIGURABLE_BANNER_ENABLED as string;
                }
                process.env.CONFIGURABLE_BANNER_TITLE = scenario.env.CONFIGURABLE_BANNER_TITLE as string;
                process.env.CONFIGURABLE_BANNER_TEXT = scenario.env.CONFIGURABLE_BANNER_TEXT as string;
            });

            beforeEach(() => {
                testApp = getAppWithMockedCsrf(sandbox);
            });

            after(() => {
                process.env.CONFIGURABLE_BANNER_ENABLED = _oldConfigurableBannerEnabled;
                process.env.CONFIGURABLE_BANNER_TITLE = _oldConfigurableBannerTitle;
                process.env.CONFIGURABLE_BANNER_TEXT = _oldConfigurableBannerText;
            });

            it(`banner shown = ${scenario.expectBannerShown}`, async () => {
                // Use a typical acceptable profile for LP (active)
                getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
                    .resolves(getMockCompanyProfile({ companyType: "limited-partnership", companyStatus: "active" }));

                // stub basket to be full so banner vs basket-full behaviour is deterministic
                sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT));

                const resp = await chai.request(testApp)
                    .get(replaceCompanyNumber(LP_ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber))
                    .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

                chai.expect(resp.status).to.equal(200);

                if (scenario.expectBannerShown) {
                    chai.expect(resp.text).to.contain(scenario.env.CONFIGURABLE_BANNER_TITLE as string);
                    chai.expect(resp.text).to.contain(scenario.env.CONFIGURABLE_BANNER_TEXT as string);
                    chai.expect(resp.text).to.not.contain("Your basket is full");
                } else {
                    chai.expect(resp.text).to.contain("Your basket is full");
                    chai.expect(resp.text).to.contain(`You cannot add more than ${BASKET_ITEM_LIMIT} items to your order.`);
                }
            });
        });
    });

    it("configurable banner does not override 'There is a problem' on start now when basket full", async () => {
        // enable banner
        const oldEnabled = process.env.CONFIGURABLE_BANNER_ENABLED;
        const oldTitle = process.env.CONFIGURABLE_BANNER_TITLE;
        const oldText = process.env.CONFIGURABLE_BANNER_TEXT;
        process.env.CONFIGURABLE_BANNER_ENABLED = "true";
        process.env.CONFIGURABLE_BANNER_TITLE = "Title";
        process.env.CONFIGURABLE_BANNER_TEXT = "Text";

        testApp = getAppWithMockedCsrf(sandbox);

        try {
            getCompanyProfileStub = sandbox.stub(CompanyProfileService.prototype, "getCompanyProfile")
                .resolves(getMockCompanyProfile({ companyType: "limited-partnership", companyStatus: "active" }));
            sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true, BASKET_ITEM_LIMIT));

            const url = replaceCompanyNumber(LP_ROOT_CERTIFICATE, mockCompanyProfileConfiguration.companyNumber) + START_BUTTON_PATH_SUFFIX;
            const resp = await chai.request(testApp)
                .get(url)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`]);

            chai.expect(resp.status).to.equal(200);
            chai.expect(resp.text).to.contain(`There is a problem`);
            chai.expect(resp.text).to.contain(`Your basket is full. To add more to your order, you&#39;ll need to remove some items first.`);
            // button disabled
            const $ = cheerio.load(resp.text);
            const startNow = $(".govuk-button--start");
            chai.expect(startNow.attr('href')).to.not.exist;
        } finally {
            process.env.CONFIGURABLE_BANNER_ENABLED = oldEnabled;
            process.env.CONFIGURABLE_BANNER_TITLE = oldTitle;
            process.env.CONFIGURABLE_BANNER_TEXT = oldText;
        }
    });
});
