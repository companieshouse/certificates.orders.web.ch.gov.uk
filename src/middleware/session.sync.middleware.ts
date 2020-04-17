import { Request, Response, NextFunction, RequestHandler } from "express";
import {SessionStore, CookieConfig, Session} from "ch-node-session-handler";
import { Cookie } from "ch-node-session-handler/lib/session/model/Cookie";

/*
SessionSync is required to make sure the changes to the session in the application
are reflected in redis. Ideally the session-library should do this. Until that is changed
this code is required
*/
export function SessionSync(config: CookieConfig, sessionStore: SessionStore): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
        if (request.path !== "/") {
            const sessionCookie = request.cookies[config.cookieName];
            if (sessionCookie) {
                const requestSession: Session = request.session.unsafeCoerce();
                const cookie = Cookie.representationOf(requestSession, config.cookieSecret);
                await sessionStore.store(cookie, requestSession.data).run();
            }
        }
        return next();
    };
}
