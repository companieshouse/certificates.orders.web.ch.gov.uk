import {Request, Response} from "express";
import {CERTIFICATE_OPTIONS, replaceCompanyNumber} from "../model/page.urls";

export default (req: Request, res: Response) => {
  const companyNumber: string = req.params.companyNumber;
  const collectionOptionsUrl = replaceCompanyNumber(CERTIFICATE_OPTIONS, companyNumber);
  res.render("index", {collectionOptionsUrl, companyNumber});
};
