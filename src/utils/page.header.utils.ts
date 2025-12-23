import { Request } from "express";
import { PageHeader } from "../model/PageHeader";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import {
    SERVICE_NAME_CERTIFICATES,
    SERVICE_NAME_CERTIFIED_COPIES,
    SERVICE_NAME_MISSING_IMAGE_DELIVERY,
    SERVICE_NAME_GENERIC
} from "../config/config";

export const mapPageHeader = (req: Request): PageHeader => {
    const userEmailAddress = req.session?.data?.signin_info?.user_profile?.email;
    const isSignedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

    let serviceName = SERVICE_NAME_GENERIC;

    if (req.path.includes("/certificates") ||
        req.path.includes("/dissolved-certificates") ||
        req.path.includes("/lp-certificates") ||
        req.path.includes("/llp-certificates")) {
        serviceName = SERVICE_NAME_CERTIFICATES;
    }
    if (req.path.includes("/certified-copies")) {
        serviceName = SERVICE_NAME_CERTIFIED_COPIES;
    }
    if (req.path.includes("/missing-image-deliveries")) {
        serviceName = SERVICE_NAME_MISSING_IMAGE_DELIVERY;
    }

    return {
        userEmailAddress,
        isSignedIn,
        serviceName
    };
};
