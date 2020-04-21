import { Request, Response, NextFunction } from "express";
import {SessionStore, CookieConfig, Session} from "ch-node-session-handler";
import { Cookie } from "ch-node-session-handler/lib/session/model/Cookie";

export default function SaveSessionWrapper(config: CookieConfig, sessionStore: SessionStore) {
    return (req: Request, response: Response, next: NextFunction) => {

        if (req.app.locals.saveSession) {
            next();
            return;
        }

        req.app.locals.saveSession = async (requestSession: Session) => {
            const cookie = Cookie.representationOf(requestSession, config.cookieSecret);
            await sessionStore.store(cookie, requestSession.data).run();
        };

        next();
        return;
    };
}
