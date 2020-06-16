import { NextFunction, Request, Response } from "express";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        res.render("");
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export default [render];
