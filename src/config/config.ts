const getEnvironmentValue = (key: string, defaultValue?: any): string => {
    const isMandatory: boolean = !defaultValue;
    const value: string = process.env[key] || "";

    if (!value && isMandatory) {
        throw new Error(`Please set the environment variable "${key}"`);
    }

    return value || defaultValue as string;
};

export const PIWIK_URL = getEnvironmentValue("PIWIK_URL");

export const PIWIK_SITE_ID = getEnvironmentValue("PIWIK_SITE_ID");

export const COOKIE_NAME = getEnvironmentValue("COOKIE_NAME");

export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET");

export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");

export const API_URL = getEnvironmentValue("API_URL");

export const CHS_URL = getEnvironmentValue("CHS_URL");

export const API_KEY = getEnvironmentValue("CHS_API_KEY");

export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN");

export const APPLICATION_NAME = "certificates.orders.web.ch.gov.uk";

export const SERVICE_NAME_CERTIFIED_COPIES = "Order a certified document";

export const PIWIK_SERVICE_NAME_CERTIFIED_COPIES = "order-a-certified-document";

export const SERVICE_NAME_CERTIFICATES = "Order a certificate";

export const PIWIK_SERVICE_NAME_CERTIFICATES = "order-a-certificate";

export const SERVICE_NAME_MISSING_IMAGE_DELIVERY = "Request a document";

export const PIWIK_SERVICE_NAME_MISSING_IMAGE_DELIVERY = "request-a-document";

export const SERVICE_NAME_GENERIC = "";

export const CERTIFICATE_PIWIK_START_GOAL_ID = getEnvironmentValue("CERTIFICATE_PIWIK_START_GOAL_ID");

export const CERTIFIED_COPIES_PIWIK_START_GOAL_ID = getEnvironmentValue("CERTIFIED_COPIES_PIWIK_START_GOAL_ID");

export const MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID = getEnvironmentValue("MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID");

export const DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID = getEnvironmentValue("DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID");

export const LP_CERTIFICATE_PIWIK_START_GOAL_ID = getEnvironmentValue("LP_CERTIFICATE_PIWIK_START_GOAL_ID");

export const LLP_CERTIFICATE_PIWIK_START_GOAL_ID = getEnvironmentValue("LLP_CERTIFICATE_PIWIK_START_GOAL_ID");

export const DISPATCH_DAYS = getEnvironmentValue("DISPATCH_DAYS");

export const DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED = getEnvironmentValue("DYNAMIC_LP_CERTIFICATE_ORDERS_ENABLED", "false") === "true";

export const DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED = getEnvironmentValue("DYNAMIC_LLP_CERTIFICATE_ORDERS_ENABLED", "false") === "true";

export const LIQUIDATED_COMPANY_CERTIFICATES_ENABLED = getEnvironmentValue("LIQUIDATED_COMPANY_CERTIFICATES_ENABLED", "false") === "true";

export const ADMINISTRATOR_COMPANY_CERTIFICATES_ENABLED = getEnvironmentValue("ADMINISTRATOR_COMPANY_CERTIFICATES_ENABLED", "false") === "true";

export const ACCOUNT_URL = getEnvironmentValue("ACCOUNT_URL");

export const CHS_MONITOR_GUI_URL = getEnvironmentValue("CHS_MONITOR_GUI_URL")

export const BASKET_WEB_URL = `${CHS_URL}/basket`;

export const BASKET_ITEM_LIMIT = Number(getEnvironmentValue("BASKET_ITEM_LIMIT"));

export const CERTIFICATE_FEEDBACK_SOURCE = `${CHS_URL}/certificates`;

export const DISSOLVED_CERTIFICATE_FEEDBACK_SOURCE = `${CHS_URL}/dissolved-certificates`;

export const CERTIFIED_COPIES_FEEDBACK_SOURCE = `${CHS_URL}/certified-copies`;

export const MISSING_IMAGE_DELIVERY_COPIES_FEEDBACK_SOURCE = `${CHS_URL}/missing-image-deliveries`;

export const LP_CERTIFICATE_FEEDBACK_SOURCE = `${CHS_URL}/lp-certificates`;

export const LLP_CERTIFICATE_FEEDBACK_SOURCE = `${CHS_URL}/llp-certificates`;