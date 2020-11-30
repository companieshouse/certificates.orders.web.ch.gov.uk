import { NextFunction, Request, Response } from "express";
import { CERTIFICATE_REGISTERED_OFFICE_OPTIONS } from "../../model/template.paths";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return res.render(CERTIFICATE_REGISTERED_OFFICE_OPTIONS);
};

const route =  async (req: Request, res: Response, next: NextFunction) => {
    return res.redirect("check-details");
};

export default route;