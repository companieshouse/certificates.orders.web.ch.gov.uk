import { NextFunction, Request, Response } from "express";
import { SCAN_UPON_DEMAND_CHECK_DETAILS } from "../../model/page.urls";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";
import { getAccessToken, getUserId } from "../../session/helper";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);

        console.log("You have hit the SCUD controller - Redirecting: " + SCAN_UPON_DEMAND_CHECK_DETAILS);
        res.redirect(SCAN_UPON_DEMAND_CHECK_DETAILS);
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};