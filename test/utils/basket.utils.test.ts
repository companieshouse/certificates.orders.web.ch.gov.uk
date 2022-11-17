
import chai from "chai";
import sinon from "sinon";
import { Request } from "express";
import * as apiClient from "../../src/client/api.client";
import { getBasketLimit, getBasketLink } from "../../src/utils/basket.utils"
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { signedInSessionData, signedOutSessionData } from "../__mocks__/redis.mocks";
const sandbox = sinon.createSandbox();
// Without this import these tests will not compile.
import { Session } from "@companieshouse/node-session-handler";
import { BASKET_ITEM_LIMIT } from "../../src/config/config";

export const getDummyBasket = (enrolled: boolean, numberOfItems: number = 1): Basket => {
    const item =
    {
        id: "MID-504916-663659",
        companyName: "TEST COMPANY",
        companyNumber: "00000000",
        description: "missing image delivery for company 00000000",
        descriptionIdentifier: "missing-image-delivery",
        descriptionValues: {
            company_number: "00000000",
            "missing-image-delivery": "missing image delivery for company 00006400"
        },
        itemCosts: [
            {
                discountApplied: "0",
                itemCost: "3",
                calculatedCost: "3",
                productType: "missing-image-delivery-mortgage"
            }
        ],
        itemOptions: {
            filingHistoryDate: "1993-08-21",
            filingHistoryDescription: "legacy",
            filingHistoryDescriptionValues: {
                description: "Declaration of satisfaction of mortgage/charge"
            },
            filingHistoryId: "MDEzNzQ1OTcyOGFkaXF6a2N4",
            filingHistoryType: "403a",
            filingHistoryCategory: "mortgage",
            filingHistoryCost: "apparently mandatory although missing in actual test case",
            filingHistoryBarcode: "apparently mandatory although missing in actual test case"
        },
        etag: "356fce2ae4efb689a579dd0f8df3e88c9767c30a",
        kind: "item#missing-image-delivery",
        links: {
            self: "/orderable/missing-image-deliveries/MID-504916-663659"
        },
        quantity: 1,
        itemUri: "/orderable/missing-image-deliveries/MID-504916-663659",
        status: "unknown",
        postageCost: "0",
        totalItemCost: "3",
        postalDelivery: false
    };

    return {
        items: Array(numberOfItems).fill(item),
        enrolled: enrolled
    };
};

describe("getBasketLink", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("should indicate that basket link is not to be rendered where no session present in request", async () => {
        chai.expect(await getBasketLink({} as Request)).to.deep.equal(
            { showBasketLink: false }
        );
    });

    it("should indicate that basket link is not to be rendered where no session data present in request", async () => {
        chai.expect(await getBasketLink({ session: {} } as Request)).to.deep.equal(
            { showBasketLink: false }
        );
    });

    it("should indicate that basket link is not to be rendered where no sign in present in request", async () => {
        chai.expect(await getBasketLink({ session: { data: signedOutSessionData } } as Request)).to.deep.equal(
            { showBasketLink: false }
        );
    });

    it("should indicate that basket link is not to be rendered where the user is not enrolled", async () => {
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(false));
        chai.expect(await getBasketLink({ session: { data: signedInSessionData } } as Request)).to.deep.equal(
            {
                showBasketLink: false,
                basketWebUrl: "http://chsurl.co/basket",
                basketItems: 1
            }
        );
    });

    it("should indicate that basket link is to be rendered where the user is enrolled", async () => {
        sandbox.stub(apiClient, "getBasket").resolves(getDummyBasket(true));
        chai.expect(await getBasketLink({ session: { data: signedInSessionData } } as Request)).to.deep.equal(
            {
                showBasketLink: true,
                basketWebUrl: "http://chsurl.co/basket",
                basketItems: 1
            }
        );
    });
});

describe("getBasketLimit", () => {
    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    it("should report items as below limit (and report configured limit) where no basket link is to be shown", () => {
        chai.expect(getBasketLimit({showBasketLink: false})).to.deep.equal(
            { basketLimit: BASKET_ITEM_LIMIT, isBelowLimit: true }
        );
    });

    it("should report items as below limit (and report configured limit) where items below limit", () => {
        chai.expect(getBasketLimit(
            {
                showBasketLink: true,
                basketWebUrl: "http://chsurl.co/basket",
                basketItems: BASKET_ITEM_LIMIT - 1
            }
        )).to.deep.equal(
            {
                basketLimit: BASKET_ITEM_LIMIT,
                isBelowLimit: true
            }
        );
    });

    it("should report items as not below limit (and report configured limit) where items at limit", () => {
        chai.expect(getBasketLimit(
            {
                showBasketLink: true,
                basketWebUrl: "http://chsurl.co/basket",
                basketItems: BASKET_ITEM_LIMIT
            }
        )).to.deep.equal(
            {
                basketLimit: BASKET_ITEM_LIMIT,
                isBelowLimit: false
            }
        );
    });

    it("should report items as not below limit (and report configured limit) where items over limit", () => {
        chai.expect(getBasketLimit(
            {
                showBasketLink: true,
                basketWebUrl: "http://chsurl.co/basket",
                basketItems: BASKET_ITEM_LIMIT + 1
            }
        )).to.deep.equal(
            {
                basketLimit: BASKET_ITEM_LIMIT,
                isBelowLimit: false
            }
        );
    });

});