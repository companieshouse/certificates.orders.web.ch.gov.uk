import { NextFunction, Request, RequestHandler, Response } from "express";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";

import { getCertificateItem } from "../client/api.client";
import { CERTIFICATE_OPTIONS, replaceCertificateId } from "./../model/page.urls";
import { getAccessToken } from "../session/helper";
import { createLogger } from "ch-structured-logging";

import { APPLICATION_NAME } from "../config/config";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session) {
            logger.info(`${req.url}: Session object is missing!`);
        }
        const signedIn = req.session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.SignedIn] === 1;

        if (!signedIn) {
            const certificateId = req.params.certificateId;
            const returnToUrl = replaceCertificateId(CERTIFICATE_OPTIONS, certificateId);
            logger.info(`User unauthorized, status_code=401, redirecting to sign in page`);
            return res.redirect(`/signin?return_to=${returnToUrl}`);
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
