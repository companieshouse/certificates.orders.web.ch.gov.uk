import { Request, Response } from "express";
// import { CHS_URL, APPLICATION_NAME } from "../config/config";
import { CERTIFIFIED_COPY_FILING_HISTORY, replaceCompanyNumber } from "../../model/page.urls";

export default (req: Request, res: Response) => {
    const companyNumber: string = req.params.companyNumber;
    const startNowUrl = replaceCompanyNumber(CERTIFIFIED_COPY_FILING_HISTORY, companyNumber);
    res.render("index", { startNowUrl, companyNumber });
};
