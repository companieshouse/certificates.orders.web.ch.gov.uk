import { NextFunction, Request, Response } from "express";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { CERTIFICATE_TYPE, replaceCompanyNumber } from "./../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../config/config";
import { getUserId } from "../session/helper";

const logger = createLogger(APPLICATION_NAME);

export default (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req.session);
        if (req.path !== "/") {
            if (!req.session) {
                logger.info(`${req.url}: Session object is missing!`);
            }
            const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

            if (!signedIn) {
                const companyNumber = req.params.companyNumber;
                const returnToUrl = replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber);
                logger.info(`User unauthorized, status_code=401, redirecting to sign in page`);
                return res.redirect(`/signin?return_to=${returnToUrl}`);
        }
    }
        logger.info(`User is signed in, user_id=${userId}`);
        next();
    } catch (err) {
        logger.error(`Authentication middleware: ${err}`);
        next(err);
    }
};
