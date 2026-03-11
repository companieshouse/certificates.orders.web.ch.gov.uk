import { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";
import { APPLICATION_NAME, CHS_URL } from "../config/config";
import { createLogger } from "@companieshouse/structured-logging-node";
import * as templatePaths from "../model/template.paths";
import { PageHeader } from "../model/PageHeader";
import { mapPageHeader } from "../utils/page.header.utils";
import { CsrfError } from "@companieshouse/web-security-node";

const logger = createLogger(APPLICATION_NAME);
const serviceName = "Find and update company information";
const SERVICE_URL = CHS_URL;

const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
    const errorStatusCode = err instanceof HttpError ? err?.statusCode : 500;
    logger.error("Error: " + `${req.path}`);
    const pageHeader: PageHeader = mapPageHeader(req);
    pageHeader.serviceName = serviceName;
    res.status(errorStatusCode).render(templatePaths.ERROR, { errorMessage: err, ...pageHeader, SERVICE_URL });
};

const csrfErrorHandler = (err: CsrfError | Error, req: Request, res: Response, next: NextFunction) => {
    // Handle non-CSRF Errors immediately
    if (!(err instanceof CsrfError)) {
        return next(err);
    }

    const pageHeader: PageHeader = mapPageHeader(req);
    return res.status(403).render(templatePaths.ERROR, {
        errorMessage: err,
        ...pageHeader,
        SERVICE_URL
    });
};

export default [errorHandler, csrfErrorHandler];
