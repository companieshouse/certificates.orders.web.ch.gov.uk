import { NextFunction, Request, RequestHandler, Response } from "express";
import { ISignInInfo } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { Session } from "ch-node-session-handler/lib/session/model/Session";

import { getCertificateItem } from "../client/api.client";
import { CERTIFICATE_OPTIONS, replaceCertificateId } from "./../model/page.urls";
import { getAccessToken } from "../session/helper";

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        // tslint:disable-next-line
        req.session.ifNothing(() => console.log(`${req.url}: Session object is missing!`));
        const signedIn: boolean = req.session
            .chain((session: Session) => session.getValue<ISignInInfo>(SessionKey.SignInInfo))
            .map((signInInfo: ISignInInfo) => signInInfo[SignInInfoKeys.SignedIn] === 1)
            .orDefault(false);

        if (!signedIn) {
            const certificateId = req.params.certificateId;
            const returnToUrl = replaceCertificateId(CERTIFICATE_OPTIONS, certificateId);
            return res.redirect(`/signin?return_to=${returnToUrl}`);
        } else {
            const accessToken: string = getAccessToken(req.session);
            await getCertificateItem(accessToken, req.params.certificateId);
        }
        next();
    } catch (err) {
        next(err);
    }
};
