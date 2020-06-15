import { NextFunction, Request, Response } from "express";
import { check, validationResult } from "express-validator";
// import { CertificateItem, CertificateItemPatchRequest } from "ch-sdk-node/dist/services/order/item/certificate/types";
import { Basket, BasketPatchRequest } from "ch-sdk-node/dist/services/order/basket/types";
import { createGovUkErrorData, GovUkErrorData } from "../../model/govuk.error.data";
import * as errorMessages from "../../model/error.messages";
import { validateCharSet } from "../../utils/char-set";
import { getAccessToken, getUserId } from "../../session/helper";
// import { getCertificateItem, patchCertificateItem, getBasket, patchBasket } from "../../client/api.client";
import { CERTIFIED_COPY_DELIVERY_DETAILS, CERTIFIED_COPY_CHECK_DETAILS } from "../../model/template.paths";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";

const FIRST_NAME_FIELD: string = "firstName";
const LAST_NAME_FIELD: string = "lastName";
const ADDRESS_LINE_ONE_FIELD: string = "addressLineOne";
const ADDRESS_LINE_TWO_FIELD: string = "addressLineTwo";
const ADDRESS_TOWN_FIELD: string = "addressTown";
const ADDRESS_COUNTY_FIELD: string = "addressCounty";
const ADDRESS_POSTCODE_FIELD: string = "addressPostcode";
const ADDRESS_COUNTRY_FIELD: string = "addressCountry";

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
