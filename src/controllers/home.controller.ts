import {Request, Response} from "express";
import {CERTIFICATE_TYPE, replaceCompanyNumber} from "../model/page.urls";

export default (req: Request, res: Response) => {
  const companyNumber: string = req.params.companyNumber;
  const startNowUrl = replaceCompanyNumber(CERTIFICATE_TYPE, companyNumber);
  res.render("index", {startNowUrl, companyNumber});
};
