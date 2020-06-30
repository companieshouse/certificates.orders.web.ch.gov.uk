import { NextFunction, Request, Response } from "express";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";

import { CERTIFIED_COPY_DELIVERY_DETAILS, replaceCertifiedCopyId } from "../../model/page.urls";
import { CERTIFIED_COPY_CHECK_DETAILS } from "../../model/template.paths";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = {
            backUrl: replaceCertifiedCopyId(CERTIFIED_COPY_DELIVERY_DETAILS, req.params.certifiedCopyId)
        };
        res.render(CERTIFIED_COPY_CHECK_DETAILS, { data });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export default [render];
