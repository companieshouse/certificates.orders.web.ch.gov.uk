import {NextFunction, Request, Response} from "express";
import * as pageUrls from "../model/page.urls";

const route = (req: Request, res: Response, next: NextFunction) => {
  res.redirect(pageUrls.GOOD_STANDING);
};

export default route;
