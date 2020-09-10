import { Request, Response } from "express";
import { SCAN_UPON_DEMAND_CHECK_DETAILS } from "../../model/template.paths";

export default async (req: Request, res: Response) => {
    res.redirect(SCAN_UPON_DEMAND_CHECK_DETAILS);
};