import { NextFunction, Request, RequestHandler, Response } from "express";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { getUserId } from "../../session/helper";
import { CERTIFIED_COPY_DELIVERY_DETAILS, replaceCertifiedCopyId } from "../../model/page.urls";

import { createLogger } from "ch-structured-logging";

import { APPLICATION_NAME } from "../../config/config";
import { getCertifiedCopyItem } from "client/api.client";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session) {
            logger.info(`${req.url}: Session object is missing!`);
        }
        const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

        if (!signedIn) {
            const certifiedCopyId = req.params.certifiedCopyId;
            const returnToUrl = replaceCertifiedCopyId(CERTIFIED_COPY_DELIVERY_DETAILS, certifiedCopyId);
            logger.info(`User unauthorized, status_code=401, redirecting to sign in page`);
            return res.redirect(`/signin?return_to=${returnToUrl}`);
        } else {
            const userId = getUserId(req.session);
            logger.info(`User is signed in, user_id=${userId}`);
        }
        next();
    } catch (err) {
        logger.error(`Certified Copies authentication middleware: ${err}`);
        next(err);
    }
};
