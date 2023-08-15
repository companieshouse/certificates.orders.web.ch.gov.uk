import { NextFunction, Request, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { getUserId } from "../../session/helper";
import { createLogger } from "@companieshouse/structured-logging-node";
import { APPLICATION_NAME } from "../../config/config";
import { getWhitelistedReturnToURL } from "../../utils/request.util";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    logger.debug(`Certified Copies start now authentication middleware, req.url = ${req.url}, req.originalUrl = ${req.originalUrl}`);
    try {
        if (req.path !== "/") {
            if (!req.session) {
                logger.info(`${req.url}: Session object is missing!`);
            }
            const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

            if (!signedIn) {
                logger.info(`Certified Copies start now: User unauthorized, status_code=401, redirecting to sign in page`);
                return res.redirect(`/signin?return_to=${getWhitelistedReturnToURL(req.originalUrl)}`);
            } else {
                const userId = getUserId(req.session);
                logger.info(`Certified Copies start now: User is signed in, user_id=${userId}`);
            }
        }
        next();
    } catch (err) {
        logger.error(`Certified Copies start now authentication middleware: ${err}`);
        next(err);
    }
};
