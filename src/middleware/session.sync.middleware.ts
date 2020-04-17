import { Request, Response, NextFunction, RequestHandler } from "express";
import {SessionStore, CookieConfig, Session} from "ch-node-session-handler";
import { Cookie } from "ch-node-session-handler/lib/session/model/Cookie";

export function SessionSync(config: CookieConfig, sessionStore: SessionStore): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
        if (request.path !== "/") {
            const sessionCookie = request.cookies[config.cookieName];
            if (sessionCookie) {
                const requestSession: Session = request.session.unsafeCoerce();
                const cook2 = Cookie.representationOf(requestSession, config.cookieSecret);
                await sessionStore.store(cook2, requestSession.data).run();
            }
        }
        return next();
    }
}