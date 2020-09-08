import { Request, Response } from "express";
import { SCAN_UPON_DEMAND_INDEX } from "../../model/template.paths";
import { SCAN_UPON_DEMAND_CREATE, replaceCompanyNumber } from "../../model/page.urls";

export default async (req: Request, res: Response) => {
    const companyNumber: string = req.params.companyNumber;
    const startNowUrl: string = replaceCompanyNumber(SCAN_UPON_DEMAND_CREATE, companyNumber);

    res.render(SCAN_UPON_DEMAND_INDEX, { companyNumber, startNowUrl });
};
