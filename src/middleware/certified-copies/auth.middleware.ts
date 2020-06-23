import { NextFunction, Request, RequestHandler, Response } from "express";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { getAccessToken } from "../../session/helper";
import { CERTIFIFIED_COPY_DELIVERY_DETAILS, replaceCertifiedCopyId } from "../../model/page.urls";

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
            const certifiedCopyId = req.params.certifiedCopyId;
            const returnToUrl = replaceCertifiedCopyId(CERTIFIFIED_COPY_DELIVERY_DETAILS, certifiedCopyId);
            logger.info(`User unauthorized, status_code=401, redirecting to sign in page`);
            return res.redirect(`/signin?return_to=${returnToUrl}`);
        } else {
            const accessToken: string = getAccessToken(req.session);
            // await getCertifiedCopyItem(accessToken, req.params.certifiedCopyId);
        }
        next();
    } catch (err) {
        logger.error(`Certificate auth middleware retrieve certified copy item, ${err}`);
        next(err);
    }
};
