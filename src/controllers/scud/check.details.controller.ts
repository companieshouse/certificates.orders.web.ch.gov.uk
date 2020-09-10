import { Request, Response } from "express";
import { SCAN_UPON_DEMAND_CHECK_DETAILS } from "../../model/template.paths";

export default async (req: Request, res: Response) => {
    console.log("Hello");
    res.render(SCAN_UPON_DEMAND_CHECK_DETAILS);
};