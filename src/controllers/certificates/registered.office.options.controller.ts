import { NextFunction, Request, Response } from "express";
import { CERTIFICATE_REGISTERED_OFFICE_OPTIONS } from "../../model/template.paths";
import { getAccessToken, getUserId } from "../../session/helper";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return res.render(CERTIFICATE_REGISTERED_OFFICE_OPTIONS);
};
