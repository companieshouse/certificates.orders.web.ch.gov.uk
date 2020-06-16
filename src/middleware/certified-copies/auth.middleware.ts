import { NextFunction, Request, RequestHandler, Response } from "express";
import { createLogger } from "ch-structured-logging";

import { APPLICATION_NAME } from "../../config/config";

const logger = createLogger(APPLICATION_NAME);

export default (req: Request, res: Response, next: NextFunction) => {
    next();
};
