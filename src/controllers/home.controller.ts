import {Request, Response} from "express";
import {ORDER_DETAILS, replaceCompanyNumber} from "../model/page.urls";
import {getCompanyProfile} from "../client/api.client";

const oAuth: string = "Z6XVoSwl_fzdW4JMPkkwUK4E26tlJKfQDbDcuN0vXqnFHj_ABPwgugsit9CqtrTKIbQDYMEgTDZLByNnAnsavA";
const url: string = "http://api.chs-dev.internal:4001";

export default async (req: Request, res: Response) => {
  const companyNumber: string = req.params.companyNumber;
  const orderDetailsUrl = replaceCompanyNumber(ORDER_DETAILS, companyNumber);
  //const getprofile = await getCompanyProfile(companyNumber, oAuth, url);
  const companyName = "bob";
  res.render("index", {orderDetailsUrl, companyNumber, companyName});
};
