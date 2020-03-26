import {Request, Response} from "express";
import {ORDER_DETAILS, replaceCompanyNumber} from "../model/page.urls";

export default async (req: Request, res: Response) => {
  const companyNumber: string = req.params.companyNumber;
  const orderDetailsUrl = replaceCompanyNumber(ORDER_DETAILS, companyNumber);
  res.render("index", {orderDetailsUrl, companyNumber});
};
