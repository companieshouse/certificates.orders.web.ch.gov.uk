import { NextFunction, Request, RequestHandler, Response } from "express";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { getUserId } from "../../session/helper";
import { MISSING_IMAGE_DELIVERY_CREATE, replaceCompanyNumberAndFilingHistoryId } from "../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";

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
            return res.redirect(`/signin?return_to=${returnToUrl}`);
        } else {
            const userId = getUserId(req.session);
            logger.info(`User is signed in, user_id=${userId}`);
        };
        next();
    } catch (err) {
        logger.error(`Missing Image Delivery authentication middleware: ${err}`);
        next(err);
    };
};
