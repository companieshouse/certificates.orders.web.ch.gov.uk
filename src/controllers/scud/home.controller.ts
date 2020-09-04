import { Request, Response } from "express";
import { SCAN_UPON_DEMAND_INDEX } from "../../model/template.paths";

export default async(req: Request, res: Response) => {
    const companyNumber: string = req.params.companyNumber;

    res.render(SCAN_UPON_DEMAND_INDEX, { companyNumber });
};