import {getAccessToken} from "../session/helper";
import {NextFunction, Request, Response} from "express";
import {addItemToBasket} from "../client/api.client";

const route = async (req: Request, res: Response, next: NextFunction) => {

    // add item to basket
    // then redirect
    const accessToken: string = getAccessToken(req.session);

    const resp = await addItemToBasket(
        accessToken,
        {itemUri: "/orderable/certificates/CHS00000000000000024"});
    console.log(resp);
    res.redirect("http://web.chs-dev.internal:4000/basket");
};

export default [route];
