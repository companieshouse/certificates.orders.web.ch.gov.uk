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

export const COOKIE_SECRET = getEnvironmentValue("COOKIE_SECRET");

export const CACHE_SERVER = getEnvironmentValue("CACHE_SERVER");

export const API_URL = getEnvironmentValue("API_URL");

export const CHS_URL = getEnvironmentValue("CHS_URL");

export const COOKIE_DOMAIN = getEnvironmentValue("COOKIE_DOMAIN");

export const APPLICATION_NAME = "certificates.orders.web.ch.gov.uk";
