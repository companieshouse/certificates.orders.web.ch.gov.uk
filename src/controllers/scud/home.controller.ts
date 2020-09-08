import { Request, Response } from "express";
import { SCAN_UPON_DEMAND_INDEX } from "../../model/template.paths";
import { SCAN_UPON_DEMAND_CREATE, replaceScudCompanyNumberAndFilingHistoryId } from "../../model/page.urls";

export default async (req: Request, res: Response) => {
    const companyNumber: string = req.params.companyNumber;
    const filingHistoryId: string = req.params.filingHistoryId;
    const startNowUrl: string = replaceScudCompanyNumberAndFilingHistoryId(SCAN_UPON_DEMAND_CREATE, companyNumber, filingHistoryId);

    res.render(SCAN_UPON_DEMAND_INDEX, { companyNumber, startNowUrl });
};
