import {Request, Response} from "express";
import {ORDER_DETAILS} from "../model/template.paths";

export default (req: Request, res: Response) => {
    res.redirect(ORDER_DETAILS);
};
