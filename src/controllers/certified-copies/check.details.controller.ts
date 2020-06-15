import { getAccessToken, getUserId } from "../../session/helper";
import { NextFunction, Request, Response } from "express";
import { addItemToBasket, getCertificateItem, getBasket } from "../../client/api.client";
import { CHS_URL, APPLICATION_NAME } from "../../config/config";
import { CertificateItem, ItemOptions } from "ch-sdk-node/dist/services/order/item/certificate/types";
import { CERTIFIED_COPY_CHECK_DETAILS } from "../../model/template.paths";

import { CERTIFIFIED_COPY_DELIVERY_DETAILS, replaceCertificateId } from "../../model/page.urls";
import { Basket, DeliveryDetails } from "ch-sdk-node/dist/services/order/basket/types";
import { createLogger } from "ch-structured-logging";

const GOOD_STANDING = "Statement of good standing";
const REGISTERED_OFFICE_ADDRESS = "Registered office address";
const DIRECTORS = "Directors";
const SECRETARIES = "Secretaries";
const COMPANY_OBJECTS = "Company objects";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        res.render('');
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

export default [render];
