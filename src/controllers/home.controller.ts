import {Request, Response} from "express";
import {ORDER_DETAILS, replaceCompanyNumber} from "../model/page.urls";
import {getCompanyProfile} from "../client/api.client";

const oAuth: string = "D0gHboWxynS1gpDbnNocyckM9MmpYc73KuT1qKJfznxZEiUXdnu1Zi7uG2sm9NSVKUuVaEA4cipZ6W1U80c3aQ";
const url: string = "http://api.chs-dev.internal:4001";

export default async (req: Request, res: Response) => {
  const companyNumber: string = req.params.companyNumber;
  const orderDetailsUrl = replaceCompanyNumber(ORDER_DETAILS, companyNumber);
  const getprofile = await getCompanyProfile(companyNumber, oAuth, url);
  const companyName = getprofile.companyName;
  res.render("index", {orderDetailsUrl, companyNumber, companyName});
};
