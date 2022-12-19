import { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";
import { APPLICATION_NAME, CHS_URL } from "../config/config";
import { createLogger } from "ch-structured-logging";
import * as templatePaths from "../model/template.paths";

const logger = createLogger(APPLICATION_NAME);
const serviceName = "Find and update company information";
const SERVICE_URL = CHS_URL;

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    const signedIn = req.session?.data.signin_info?.signed_in;
    const userEmail = req.session?.data?.signin_info?.user_profile?.email;
    const errorStatusCode = err instanceof HttpError ? err?.statusCode : 500;
    logger.error("Error: " + `${req.path}`);
    res.status(errorStatusCode).render(templatePaths.ERROR, { errorMessage: err, signedIn, userEmail, serviceName, SERVICE_URL });
};

export default errorHandler;
