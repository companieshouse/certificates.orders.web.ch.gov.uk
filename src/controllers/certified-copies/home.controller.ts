import { Request, Response } from "express";
import { CERTIFIFIED_COPY_FILING_HISTORY, replaceCompanyNumber } from "../../model/page.urls";
import { CERTIFIED_COPY_INDEX } from "../../model/template.paths";
import { CHS_URL } from "../../config/config";

export default (req: Request, res: Response) => {
    const companyNumber: string = req.params.companyNumber;
    const startNowUrl = `${CHS_URL}${replaceCompanyNumber(CERTIFIFIED_COPY_FILING_HISTORY, companyNumber)}`;
    res.render(CERTIFIED_COPY_INDEX, { startNowUrl, companyNumber });
};
