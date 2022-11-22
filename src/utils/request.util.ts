import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../config/config";

const logger = createLogger(APPLICATION_NAME);

export const CERTIFICATE_OPTIONS_RE = /\/orderable\/certificates\/CRT-\d{6}-\d{6}\/certificate-options/;
export const LP_CERTIFICATE_OPTIONS_RE = /\/orderable\/lp-certificates\/CRT-\d{6}-\d{6}\/certificate-options/;
export const LLP_CERTIFICATE_OPTIONS_RE = /\/orderable\/llp-certificates\/CRT-\d{6}-\d{6}\/certificate-options/;
export const CERTIFIED_COPIES_DELIVERY_DETAILS_RE = /\/orderable\/certified-copies\/CCD-\d{6}-\d{6}\/delivery-details/;
export const CERTIFIED_COPIES_DELIVERY_OPTIONS_RE = /\/orderable\/certified-copies\/CCD-\d{6}-\d{6}\/delivery-options/;
export const DISSOLVED_CERTIFICATE_DELIVERY_DETAILS_RE = /\/orderable\/dissolved-certificates\/CRT-\d{6}-\d{6}\/delivery-details/;
export const DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS_RE = /\/orderable\/dissolved-certificates\/CRT-\d{6}-\d{6}\/delivery-options/;
export const MISSING_IMAGE_DELIVERY_CREATE_RE = /\/company\/[A-Z0-9]{8}\/orderable\/missing-image-deliveries\/[a-zA-Z0-9]{8,}\/create/;
export const MISSING_IMAGE_DELIVERY_CHECK_DETAILS_RE = /\/orderable\/missing-image-deliveries\/MID-\d{6}-\d{6}\/check-details/;
export const CERTIFIED_DOCUMENTS_SELECTION_RE = /\/company\/[A-Z0-9]{8}\/certified-documents/;
const REDIRECTS_WHITELIST: RegExp[] = [
    CERTIFICATE_OPTIONS_RE,
    LP_CERTIFICATE_OPTIONS_RE,
    LLP_CERTIFICATE_OPTIONS_RE,
    CERTIFIED_COPIES_DELIVERY_DETAILS_RE,
    CERTIFIED_COPIES_DELIVERY_OPTIONS_RE,
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS_RE,
    DISSOLVED_CERTIFICATE_DELIVERY_OPTIONS_RE,
    MISSING_IMAGE_DELIVERY_CREATE_RE,
    MISSING_IMAGE_DELIVERY_CHECK_DETAILS_RE,
    CERTIFIED_DOCUMENTS_SELECTION_RE
];

// getWhitelistedReturnToURL performs checks on the return to URL to be used in a redirect, as it is obtained from the
// inbound request, and therefore potentially subject to forging attacks.
// Without these checks, SonarQube reports that the affected redirects contain a Blocker level security vulnerability.
// Throws an Error if no match found.
export const getWhitelistedReturnToURL = (returnToUrl: string) => {
    logger.info(`Looking up return to URL ${returnToUrl} in whitelist.`);
    let value: string | null;
    for (const expression of REDIRECTS_WHITELIST) {
        value = extractValueIfPresentFromRequestField(returnToUrl, expression);
        if (value) return value;
    }
    const error = `Return to URL ${returnToUrl} not found in trusted URLs whitelist ${REDIRECTS_WHITELIST}.`;
    logger.error(error);
    throw new Error(error);
};

// extractValueFromRequestField extracts a value that matches the regular expression provided from the request field.
// Extracting a value from a field from the incoming request in this way appears to allay SonarQube's fears that
// any redirect using the value is doing so using user-controlled data.
// Throws an Error if no match found.
export const extractValueFromRequestField = (requestField: string, expression: RegExp) => {
    if (requestField) {
        const extractedMatches = requestField.match(expression);
        if (extractedMatches !== null && extractedMatches.length > 0) {
            return extractedMatches[0];
        }
    }
    const error = `Unable to extract value sought from requestField ${requestField} using regular expression ${expression}`;
    logger.error(error);
    throw new Error(error);
};

// extractValueIfPresentFromRequestField extracts a value that matches the regular expression provided from the request
// field.
// Extracting a value from a field from the incoming request in this way appears to allay SonarQube's fears that
// any redirect using the value is doing so using user-controlled data.
// Returns null if no match found.
export const extractValueIfPresentFromRequestField = (requestField: string, expression: RegExp) => {
    if (requestField) {
        const extractedMatches = requestField.match(expression);
        if (extractedMatches !== null && extractedMatches.length > 0) {
            return extractedMatches[0];
        }
    }
    return null;
};
