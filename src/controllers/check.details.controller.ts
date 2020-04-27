import {getAccessToken, getExtraData} from "../session/helper";
import {NextFunction, Request, Response} from "express";
import {addItemToBasket} from "../client/api.client";
import {CHS_URL} from "../session/config";

const route = async (req: Request, res: Response, next: NextFunction) => {

    // add item to basket
    // then redirect
    try {
    const accessToken: string = getAccessToken(req.session);
    const certificateId: string = getExtraData(req.session)?.certificate?.id!;

    const resp = await addItemToBasket(
        accessToken,
        {itemUri: `/orderable/certificates/${certificateId}`});
    res.redirect(`${CHS_URL}/basket`);
    } catch (error) {
        return next(error);
    }
};

export default [route];
