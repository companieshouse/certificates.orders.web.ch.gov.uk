import {
    BASKET_RE,
    extractValueFromRequestField, extractValueIfPresentFromRequestField,
    getWhitelistedReturnToURL,
    ORDER_CONFIRMATION_RE,
    ORDERS_RE
} from "../../src/utils/request.util";
import { expect } from "chai";
import { ORDER_CONFIRMATION, BASKET, ORDERS } from "./constants";
// TODO GCI-2122 Do we have any equivalent? import { BASKET, ORDERS } from "../../src/model/page.urls";

const UNKNOWN_URL = "/unknown";

describe("request.util.unit",
    () => {
        describe("extractValueFromRequestField", () => {
            it("gets correct return to URL for orders page", () => {
                const returnToUrl = extractValueFromRequestField(ORDERS, ORDERS_RE);
                expect(returnToUrl).to.equal(ORDERS);
            });

            it("gets correct return to URL for order complete page", () => {
                const returnToUrl = extractValueFromRequestField(ORDER_CONFIRMATION, ORDER_CONFIRMATION_RE);
                expect(returnToUrl).to.equal(ORDER_CONFIRMATION);
            });

            it("gets correct return to URL for basket page", () => {
                const returnToUrl = extractValueFromRequestField(BASKET, BASKET_RE);
                expect(returnToUrl).to.equal(BASKET);
            });

            it("errors if asked to look up an unknown page URL", () => {
                const execution = () => extractValueFromRequestField(UNKNOWN_URL, ORDERS_RE);
                expect(execution).to.throw("Unable to extract value sought from requestField /unknown using regular expression /\\/orders/");
            });
        });

        describe("extractValueIfPresentFromRequestField", () => {
            it("gets correct return to URL for orders page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(ORDERS, ORDERS_RE);
                expect(returnToUrl).to.equal(ORDERS);
            });

            it("gets correct return to URL for order complete page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(ORDER_CONFIRMATION, ORDER_CONFIRMATION_RE);
                expect(returnToUrl).to.equal(ORDER_CONFIRMATION);
            });

            it("gets correct return to URL for basket page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(BASKET, BASKET_RE);
                expect(returnToUrl).to.equal(BASKET);
            });

            it("returns null if asked to look up an unknown page URL", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(UNKNOWN_URL, ORDERS_RE);
                expect(returnToUrl).to.equal(null);
            });
        });

        describe("getWhitelistedReturnToURL", () => {
            it("gets correct return to URL for orders page", () => {
                const returnToUrl = getWhitelistedReturnToURL(ORDERS);
                expect(returnToUrl).to.equal(ORDERS);
            });

            it("gets correct return to URL for order complete page", () => {
                const returnToUrl = getWhitelistedReturnToURL(ORDER_CONFIRMATION);
                expect(returnToUrl).to.equal(ORDER_CONFIRMATION);
            });

            it("gets correct return to URL for basket page", () => {
                const returnToUrl = getWhitelistedReturnToURL(BASKET);
                expect(returnToUrl).to.equal(BASKET);
            });

            it("errors if asked to look up an unknown page URL", () => {
                const execution = () => getWhitelistedReturnToURL(UNKNOWN_URL);
                expect(execution).to.throw("/\\/orders\\/ORD-\\d{6}-\\d{6}\\/confirmation\\?ref=orderable_item_ORD-\\d{6}-\\d{6}&state=[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}&status=[a-z]*/,/\\/orders/,/\\/basket/.");
            });
        });
    });
