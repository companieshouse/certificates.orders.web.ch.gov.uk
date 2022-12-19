import { Request } from "express";
import { PageHeader } from "../model/PageHeader";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import {
    PIWIK_SITE_ID,
    PIWIK_URL,
    COOKIE_SECRET,
    COOKIE_DOMAIN,
    CACHE_SERVER,
    APPLICATION_NAME,
    SERVICE_NAME_CERTIFICATES,
    PIWIK_SERVICE_NAME_CERTIFICATES,
    SERVICE_NAME_CERTIFIED_COPIES,
    PIWIK_SERVICE_NAME_CERTIFIED_COPIES,
    SERVICE_NAME_MISSING_IMAGE_DELIVERY,
    PIWIK_SERVICE_NAME_MISSING_IMAGE_DELIVERY,
    SERVICE_NAME_GENERIC,
    CERTIFICATE_PIWIK_START_GOAL_ID,
    CERTIFIED_COPIES_PIWIK_START_GOAL_ID,
    MISSING_IMAGE_DELIVERY_PIWIK_START_GOAL_ID,
    DISSOLVED_CERTIFICATE_PIWIK_START_GOAL_ID,
    CHS_URL,
    LP_CERTIFICATE_PIWIK_START_GOAL_ID, LLP_CERTIFICATE_PIWIK_START_GOAL_ID
} from "../config/config";

export const mapPageHeader = (req: Request): PageHeader => {

    const userEmailAddress = req.session?.data?.signin_info?.user_profile?.email;
    const isSignedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

    let serviceName = SERVICE_NAME_GENERIC;

    if (req.path.includes("/certificates") || req.path.includes("/dissolved-certificates")) {
        serviceName = SERVICE_NAME_CERTIFICATES;
    }

    return {
        userEmailAddress: userEmailAddress,
        isSignedIn: isSignedIn,
        serviceName: serviceName
    };
}