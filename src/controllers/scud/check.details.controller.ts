import { NextFunction, Request, Response } from "express";
import { SCAN_UPON_DEMAND_CHECK_DETAILS } from "../../model/template.paths";
import { getAccessToken, getUserId } from "../../session/helper";
import { APPLICATION_NAME } from "../../config/config";
import { createLogger } from "ch-structured-logging";

const logger = createLogger(APPLICATION_NAME);

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        
        console.log("You have hit the check details controller, Rendering: " + SCAN_UPON_DEMAND_CHECK_DETAILS);
        return res.render(SCAN_UPON_DEMAND_CHECK_DETAILS);
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};