import { NextFunction, Request, RequestHandler, Response } from "express";
import { ISignInInfo } from "ch-node-session-handler/lib/session/model/SessionInterfaces";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";
import { Session, VerifiedSession } from "ch-node-session-handler/lib/session/model/Session";
import { ORDER_DETAILS_FULL_URL } from "./../model/page.urls";

export default (req: Request, res: Response, next: NextFunction) => {
    if (req.path !== "/orderable/certificates" && !req.path.startsWith("/orderable/certificates/static")) {
        req.session.ifNothing(() => console.log(`${req.url}: Session object is missing!`));
        const signedIn: boolean = req.session
                .chain((session: Session) => session.getValue<ISignInInfo>(SessionKey.SignInInfo))
                .map((signInInfo: ISignInInfo) => signInInfo[SignInInfoKeys.SignedIn] === 1)
                .orDefault(false);

        if (!signedIn) {
            return res.redirect(`/signin?return_to=${ORDER_DETAILS_FULL_URL}`);
        }
    }
    next();
};
