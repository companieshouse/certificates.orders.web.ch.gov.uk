import { NextFunction, Request, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { getUserId } from "../../session/helper";
import {
    MISSING_IMAGE_DELIVERY_CHECK_DETAILS,
    MISSING_IMAGE_DELIVERY_CREATE,
    replaceCompanyNumberAndFilingHistoryId,
    replaceMissingImageDeliveryId
} from "../../model/page.urls";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../config/config";
import { getWhitelistedReturnToURL } from "../../utils/request.util";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session) {
            logger.info(`${req.url}: Session object is missing!`);
        }
        const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

        if (!signedIn) {
            const companyNumber = req.params.companyNumber;
            const filingHistoryId = req.params.filingHistoryId;
            const returnToUrl = replaceCompanyNumberAndFilingHistoryId(MISSING_IMAGE_DELIVERY_CREATE, companyNumber, filingHistoryId);
            logger.info(`User unauthorized, status_code=401, redirecting to sign in page`);
            return res.redirect(`/signin?return_to=${getWhitelistedReturnToURL(returnToUrl)}`);
        } else {
            const userId = getUserId(req.session);
            logger.info(`User is signed in, user_id=${userId}`);
        }
        next();
    } catch (err) {
        logger.error(`Missing Image Delivery authentication middleware: ${err}`);
        next(err);
    }
};

export const authMissingImageDeliveryCheckDetailsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session) {
            logger.info(`${req.url}: Session object is missing!`);
        }
        const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

        if (!signedIn) {
            const missingImageDeliveryId = req.params.missingImageDeliveryId;
            const returnToUrl = replaceMissingImageDeliveryId(MISSING_IMAGE_DELIVERY_CHECK_DETAILS, missingImageDeliveryId);
            logger.info(`User unauthorized, status_code=401, redirecting to sign in page`);
            return res.redirect(`/signin?return_to=${getWhitelistedReturnToURL(returnToUrl)}`);
        } else {
            const userId = getUserId(req.session);
            logger.info(`User is signed in, user_id=${userId}`);
        }
        next();
    } catch (err) {
        logger.error(`Missing Image Delivery authentication middleware: ${err}`);
        next(err);
    }
};
