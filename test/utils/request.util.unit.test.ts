import {
    extractValueFromRequestField,
    extractValueIfPresentFromRequestField,
    getWhitelistedReturnToURL,
    CERTIFICATE_OPTIONS_RE,
    LP_CERTIFICATE_OPTIONS_RE,
    LLP_CERTIFICATE_OPTIONS_RE,
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS_RE
} from "../../src/utils/request.util";
import { expect } from "chai";
import {
    CERTIFICATE_OPTIONS_PAGE,
    DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS_PAGE,
    LLP_CERTIFICATE_OPTIONS_PAGE,
    LP_CERTIFICATE_OPTIONS_PAGE
} from "./constants";

const UNKNOWN_URL = "/unknown";

describe("request.util.unit",
    () => {
        describe("extractValueFromRequestField", () => {
            it("gets correct return to URL for certificate options page", () => {
                const returnToUrl = extractValueFromRequestField(CERTIFICATE_OPTIONS_PAGE, CERTIFICATE_OPTIONS_RE);
                expect(returnToUrl).to.equal(CERTIFICATE_OPTIONS_PAGE);
            });

            it("gets correct return to URL for LP certificate options page", () => {
                const returnToUrl = extractValueFromRequestField(LP_CERTIFICATE_OPTIONS_PAGE,
                    LP_CERTIFICATE_OPTIONS_RE);
                expect(returnToUrl).to.equal(LP_CERTIFICATE_OPTIONS_PAGE);
            });

            it("gets correct return to URL for LLP certificate options page", () => {
                const returnToUrl = extractValueFromRequestField(LLP_CERTIFICATE_OPTIONS_PAGE,
                    LLP_CERTIFICATE_OPTIONS_RE);
                expect(returnToUrl).to.equal(LLP_CERTIFICATE_OPTIONS_PAGE);
            });

            it("gets correct return to URL for dissolved certificate delivery options page", () => {
                const returnToUrl = extractValueFromRequestField(DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS_PAGE,
                    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS_RE);
                expect(returnToUrl).to.equal(DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS_PAGE);
            });

            it("errors if asked to look up an unknown page URL", () => {
                const execution = () => extractValueFromRequestField(UNKNOWN_URL, CERTIFICATE_OPTIONS_RE);
                expect(execution).to.throw("Unable to extract value sought from requestField /unknown using regular " +
                    "expression /\\/orderable\\/certificates\\/CRT-\\d{6}-\\d{6}\\/certificate-options/");
            });
        });

        describe("extractValueIfPresentFromRequestField", () => {
            it("gets correct return to URL for certificate options page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(CERTIFICATE_OPTIONS_PAGE,
                    CERTIFICATE_OPTIONS_RE);
                expect(returnToUrl).to.equal(CERTIFICATE_OPTIONS_PAGE);
            });

            it("gets correct return to URL for LP certificate options page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(LP_CERTIFICATE_OPTIONS_PAGE,
                    LP_CERTIFICATE_OPTIONS_RE);
                expect(returnToUrl).to.equal(LP_CERTIFICATE_OPTIONS_PAGE);
            });

            it("gets correct return to URL for LLP certificate options page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(LLP_CERTIFICATE_OPTIONS_PAGE,
                    LLP_CERTIFICATE_OPTIONS_RE);
                expect(returnToUrl).to.equal(LLP_CERTIFICATE_OPTIONS_PAGE);
            });

            it("gets correct return to URL for dissolved certificate delivery options page", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS_PAGE,
                    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS_RE);
                expect(returnToUrl).to.equal(DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS_PAGE);
            });

            it("returns null if asked to look up an unknown page URL", () => {
                const returnToUrl = extractValueIfPresentFromRequestField(UNKNOWN_URL, CERTIFICATE_OPTIONS_RE);
                expect(returnToUrl).to.equal(null);
            });
        });

        describe("getWhitelistedReturnToURL", () => {
            it("gets correct return to URL for certificate options page", () => {
                const returnToUrl = getWhitelistedReturnToURL(CERTIFICATE_OPTIONS_PAGE);
                expect(returnToUrl).to.equal(CERTIFICATE_OPTIONS_PAGE);
            });

            it("gets correct return to URL for LP certificate options page", () => {
                const returnToUrl = getWhitelistedReturnToURL(LP_CERTIFICATE_OPTIONS_PAGE);
                expect(returnToUrl).to.equal(LP_CERTIFICATE_OPTIONS_PAGE);
            });

            it("gets correct return to URL for LLP certificate options page", () => {
                const returnToUrl = getWhitelistedReturnToURL(LLP_CERTIFICATE_OPTIONS_PAGE);
                expect(returnToUrl).to.equal(LLP_CERTIFICATE_OPTIONS_PAGE);
            });

            it("gets correct return to URL for dissolved certificate delivery options page", () => {
                const returnToUrl = getWhitelistedReturnToURL(DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS_PAGE)
                expect(returnToUrl).to.equal(DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS_PAGE);
            });

            it("errors if asked to look up an unknown page URL", () => {
                const execution = () => getWhitelistedReturnToURL(UNKNOWN_URL);
                expect(execution).to.throw("Return to URL /unknown not found in trusted URLs whitelist " +
                    "/\\/orderable\\/certificates\\/CRT-\\d{6}-\\d{6}\\/certificate-options/," +
                    "/\\/orderable\\/lp-certificates\\/CRT-\\d{6}-\\d{6}\\/certificate-options/," +
                    "/\\/orderable\\/llp-certificates\\/CRT-\\d{6}-\\d{6}\\/certificate-options/," +
                    "/\\/orderable\\/dissolved-certificates\\/CRT-\\d{6}-\\d{6}\\/delivery-details/.");
            });
        });
    });
