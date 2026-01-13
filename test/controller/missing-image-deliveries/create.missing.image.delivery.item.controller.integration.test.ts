import chai from "chai";
import sinon from "sinon";
import ioredis from "ioredis";

import * as apiClient from "../../../src/client/api.client";
import { MISSING_IMAGE_DELIVERY_CREATE, replaceCompanyNumberAndFilingHistoryId } from "../../../src/model/page.urls";
import { SIGNED_IN_COOKIE, signedInSession } from "../../__mocks__/redis.mocks";
import { getAppWithMockedCsrf } from '../../__mocks__/csrf.mocks';
import { MidItem } from "@companieshouse/api-sdk-node/dist/services/order/mid/types";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";

const FILING_HISTORY_ID = "MzAwOTM2MDg5OWFkaXF6a2N4";
const COMPANY_NUMBER = "00006500";
const MISSING_IMAGE_DELIVERY_CREATE_URL = replaceCompanyNumberAndFilingHistoryId(MISSING_IMAGE_DELIVERY_CREATE, COMPANY_NUMBER, FILING_HISTORY_ID);

const sandbox = sinon.createSandbox();
let testApp: null = null;
let postMissingImageDeliveryItemStub;
let getBasketStub;

const basketDetails = {
    deliveryDetails: {
        forename: "bob",
        surname: "jones",
        addressLine1: "117 kings road",
        addressLine2: "pontcanna",
        country: "wales",
        locality: "canton",
        postalCode: "cf5 4xb",
        region: "glamorgan"
    },
    items: [
        {
            totalItemCost: "15"
        }
    ]
} as Basket;

describe("create.missing.image.delivery.item.controller.integration", () => {
    beforeEach((done) => {
        sandbox.stub(ioredis.prototype, "connect").returns(Promise.resolve());
        sandbox.stub(ioredis.prototype, "get").returns(Promise.resolve(signedInSession));

        testApp = getAppWithMockedCsrf(sandbox);
        done();
    });

    afterEach(() => {
        sandbox.reset();
        sandbox.restore();
    });

    describe("missing image delivery item", () => {
        it("redirects the user to the check details page", async () => {
            const missingImageDeliveryDetails = {
                id: "MID-951616-000712"
            } as MidItem;

            getBasketStub = sandbox.stub(apiClient, "getBasket")
            .returns(Promise.resolve(basketDetails));
            postMissingImageDeliveryItemStub = sandbox.stub(apiClient, "postMissingImageDeliveryItem")
                .returns(Promise.resolve(missingImageDeliveryDetails));

            const resp = await chai.request(testApp)
                .get(MISSING_IMAGE_DELIVERY_CREATE_URL)
                .set("Cookie", [`__SID=${SIGNED_IN_COOKIE}`])
                .redirects(0);

            chai.expect(resp.status).to.equal(302);
            chai.expect(resp.text).to.include("Found. Redirecting to /orderable/missing-image-deliveries/MID-951616-000712/check-details");
        });
    });
});
