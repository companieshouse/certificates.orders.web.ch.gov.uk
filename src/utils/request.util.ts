import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../config/config";

const logger = createLogger(APPLICATION_NAME);

export const ORDER_CONFIRMATION_RE = /\/orders\/ORD-\d{6}-\d{6}\/confirmation\?ref=orderable_item_ORD-\d{6}-\d{6}&state=[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}&status=[a-z]*/;
export const ORDERS_RE = /\/orders/;
export const BASKET_RE = /\/basket/;
const REDIRECTS_WHITELIST: RegExp[] = [ORDER_CONFIRMATION_RE, ORDERS_RE, BASKET_RE];

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
export const extractValueFromRequestField = (requestField: String, expression: RegExp) => {
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
export const extractValueIfPresentFromRequestField = (requestField: String, expression: RegExp) => {
    if (requestField) {
        const extractedMatches = requestField.match(expression);
        if (extractedMatches !== null && extractedMatches.length > 0) {
            return extractedMatches[0];
        }
    }
    return null;
};
