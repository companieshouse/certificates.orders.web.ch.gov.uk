import { NextFunction, Request, RequestHandler, Response } from "express";
import { SessionKey } from "ch-node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "ch-node-session-handler/lib/session/keys/SignInInfoKeys";

// import { getCertificateItem } from "../../client/api.client";
import { getAccessToken } from "../../session/helper";
import { createLogger } from "ch-structured-logging";

import { APPLICATION_NAME } from "../../config/config";

const logger = createLogger(APPLICATION_NAME);

export default (req: Request, res: Response, next: NextFunction) => {
    next();
};
