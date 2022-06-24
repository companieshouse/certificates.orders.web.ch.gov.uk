import { NextFunction, Request, RequestHandler, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";

import {getCertificateItem} from "../../client/api.client";
import {
    CERTIFICATE_OPTIONS,
    replaceCertificateId,
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS,
    LP_CERTIFICATE_OPTIONS, LLP_CERTIFICATE_OPTIONS
} from "../../model/page.urls";
import { getAccessToken } from "../../session/helper";
import { createLogger } from "ch-structured-logging";

import {APPLICATION_NAME} from "../../config/config";
import { getWhitelistedReturnToURL } from "../../utils/request.util";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session) {
            logger.info(`${req.url}: Session object is missing!`);
        }
        const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

        if (!signedIn) {
            const certificateId = req.params.certificateId;
            const originatingUrl = req.originalUrl;
            let returnToUrl;

            if (originatingUrl.includes("/dissolved-certificates")) {
                returnToUrl = replaceCertificateId(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, certificateId);
            } else if (originatingUrl.includes("/lp-certificates")) {
                returnToUrl = replaceCertificateId(LP_CERTIFICATE_OPTIONS, certificateId);
            } else if (originatingUrl.includes("/llp-certificates")) {
                returnToUrl = replaceCertificateId(LLP_CERTIFICATE_OPTIONS, certificateId);
            } else if (originatingUrl.includes("/certificates")) {
                returnToUrl = replaceCertificateId(CERTIFICATE_OPTIONS, certificateId);
            }
            logger.info(`User unauthorized, status_code=401, redirecting to sign in page`);
            if (isValidReturnToUrl(returnToUrl)) {
                return res.redirect(`/signin?return_to=${getWhitelistedReturnToURL(returnToUrl)}`);
            }
        } else {
            const accessToken: string = getAccessToken(req.session);
            await getCertificateItem(accessToken, req.params.certificateId);
        }
        next();
    } catch (err) {
        logger.error(`Certificate auth middleware retrieve certificate item, ${err}`);
        next(err);
    }
};

export const isValidReturnToUrl = (returnToUrl: string) => {
    logger.debug(`Checking if return to URL is valid, return_to url=${returnToUrl}`);
    return returnToUrl.startsWith("/orderable/certificates/") ||
        returnToUrl.startsWith("/orderable/dissolved-certificates") ||
        returnToUrl.startsWith("/orderable/lp-certificates/") ||
        returnToUrl.startsWith("/orderable/llp-certificates/");
};