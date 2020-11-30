import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { CERTIFICATE_REGISTERED_OFFICE_OPTIONS } from "../../model/template.paths";
import { CertificateItem } from "ch-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem } from "../../client/api.client";
import { getAccessToken, getUserId } from "../../session/helper";
import { createLogger } from "ch-structured-logging";
import { registeredOfficeAddressValidationRules, validate } from "../../validation/certificates/registered.office.options.validation";
import { APPLICATION_NAME } from "../../config/config";

const logger = createLogger(APPLICATION_NAME);

const REGISTERED_OFFICE_OPTION: string = "registered-office";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);

    return res.render(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, {
        companyNumber: certificateItem.companyNumber,
    });
};

const route =  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    const errorList = validate(errors);
    const registeredOfficeOption: string
        = req.body[REGISTERED_OFFICE_OPTION];

    console.log(registeredOfficeOption);

    const util = require('util');
    console.log(util.inspect(errorList, {showHidden: false, depth: null}))

    if (!errors.isEmpty()) {

        return res.render(CERTIFICATE_REGISTERED_OFFICE_OPTIONS, {
            ...errorList,
            registeredOfficeOption,
        });
    }

    return res.redirect("check-details");
};

export default [...registeredOfficeAddressValidationRules, route];
