import { Request, Response } from "express";
import { MISSING_IMAGE_DELIVERY_INDEX } from "../../model/template.paths";
import { MISSING_IMAGE_DELIVERY_CREATE, replaceCompanyNumberAndFilingHistoryId } from "../../model/page.urls";

export default async (req: Request, res: Response) => {
    const companyNumber: string = req.params.companyNumber;
    const filingHistoryId: string = req.params.filingHistoryId;
    const startNowUrl: string = replaceCompanyNumberAndFilingHistoryId(MISSING_IMAGE_DELIVERY_CREATE, companyNumber, filingHistoryId);

    res.render(MISSING_IMAGE_DELIVERY_INDEX, { companyNumber, startNowUrl });
};
