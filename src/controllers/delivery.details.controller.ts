import {NextFunction, Request, Response} from "express";
import {check, validationResult} from "express-validator";
import { CertificateItem } from "ch-sdk-node/dist/services/order/item/certificate/types";

import {createGovUkErrorData, GovUkErrorData} from "../model/govuk.error.data";
import * as errorMessages from "../model/error.messages";
import * as templatePaths from "../model/template.paths";
import {validateCharSet} from "../utils/char-set";
import {getAccessToken } from "../session/helper";
import {getCertificateItem} from "../client/api.client";

const FIRST_NAME_FIELD: string = "firstName";
const LAST_NAME_FIELD: string = "lastName";
const ADDRESS_LINE_ONE_FIELD: string = "addressLineOne";
const ADDRESS_LINE_TWO_FIELD: string = "addressLineTwo";
const ADDRESS_TOWN_FIELD: string = "addressTown";
const ADDRESS_COUNTY_FIELD: string = "addressCounty";
const ADDRESS_POSTCODE_FIELD: string = "addressPostcode";
const ADDRESS_COUNTRY_FIELD: string = "addressCountry";

const validators = [
    check(FIRST_NAME_FIELD)
        .not().isEmpty().withMessage(errorMessages.ORDERS_DETAILS_FIRST_NAME_EMPTY)
        .isLength({max: 32}).withMessage(errorMessages.ORDER_DETAILS_FIRST_NAME_MAX_LENGTH)
        .custom((firstName, {req}) => {
            const invalidChar = validateCharSet(req.body[FIRST_NAME_FIELD]);
            if (invalidChar) {
                throw Error(errorMessages.FIRST_NAME_INVALID_CHARACTERS + invalidChar);
            }
            return true;
        }),
    check(LAST_NAME_FIELD)
        .not().isEmpty().withMessage(errorMessages.ORDERS_DETAILS_LAST_NAME_EMPTY)
        .isLength({max: 32}).withMessage(errorMessages.ORDER_DETAILS_LAST_NAME_MAX_LENGTH)
        .custom((lastName, {req}) => {
            const invalidChar = validateCharSet(req.body[LAST_NAME_FIELD]);
            if (invalidChar) {
                throw Error(errorMessages.LAST_NAME_INVALID_CHARACTERS + invalidChar);
            }
            return true;
        }),
    check(ADDRESS_LINE_ONE_FIELD)
        .not().isEmpty().withMessage(errorMessages.ADDRESS_LINE_ONE_EMPTY)
        .isLength({max: 50}).withMessage(errorMessages.ADDRESS_LINE_ONE_MAX_LENGTH)
        .custom((addressLineOne, {req}) => {
            const invalidChar = validateCharSet(req.body[ADDRESS_LINE_ONE_FIELD]);
            if (invalidChar) {
                throw Error(errorMessages.ADDRESS_LINE_ONE_INVALID_CHARACTERS + invalidChar);
            }
            return true;
        }),
    check(ADDRESS_LINE_TWO_FIELD)
        .isLength({max: 50}).withMessage(errorMessages.ADDRESS_LINE_TWO_MAX_LENGTH)
        .custom((addressLineTwo, {req}) => {
            const invalidChar = validateCharSet(req.body[ADDRESS_LINE_TWO_FIELD]);
            if (invalidChar) {
                throw Error(errorMessages.ADDRESS_LINE_TWO_INVALID_CHARACTERS + invalidChar);
            }
            return true;
        }),
    check(ADDRESS_TOWN_FIELD)
        .not().isEmpty().withMessage(errorMessages.ADDRESS_TOWN_EMPTY)
        .isLength({max: 50}).withMessage(errorMessages.ADDRESS_TOWN_MAX_LENGTH)
        .custom((addressTown, {req}) => {
            const invalidChar = validateCharSet(req.body[ADDRESS_TOWN_FIELD]);
            if (invalidChar) {
                throw Error(errorMessages.ADDRESS_TOWN_INVALID_CHARACTERS + invalidChar);
            }
            return true;
        }),

    check(ADDRESS_COUNTY_FIELD)
        .custom((addressCounty, {req}) => {
            const addressPostcodeValue = req.body[ADDRESS_POSTCODE_FIELD];
            if (!addressPostcodeValue && !addressCounty) {
                throw Error(errorMessages.ADDRESS_COUNTY_AND_POSTCODE_EMPTY);
            }
            return true;
        }),
    check(ADDRESS_COUNTY_FIELD)
        .isLength({max: 50}).withMessage(errorMessages.ADDRESS_COUNTY_MAX_LENGTH)
        .custom((addressCounty, {req}) => {
            const invalidChar = validateCharSet(req.body[ADDRESS_COUNTY_FIELD]);
            if (invalidChar) {
                throw Error(errorMessages.ADDRESS_COUNTY_INVALID_CHARACTERS + invalidChar);
            }
            return true;
        }),
    check(ADDRESS_POSTCODE_FIELD)
        .isLength({max: 15}).withMessage(errorMessages.ADDRESS_POSTCODE_MAX_LENGTH)
        .custom((addressPostcode, {req}) => {
            const invalidChar = validateCharSet(req.body[ADDRESS_POSTCODE_FIELD]);
            if (invalidChar) {
                throw Error(errorMessages.ADDRESS_POSTCODE_INVALID_CHARACTERS + invalidChar);
            }
            return true;
        }),
    check(ADDRESS_COUNTRY_FIELD)
        .isLength({max: 50}).withMessage(errorMessages.ADDRESS_COUNTRY_MAX_LENGTH)
        .custom((addressCountry, {req}) => {
            const invalidChar = validateCharSet(req.body[ADDRESS_COUNTRY_FIELD]);
            if (invalidChar) {
                throw Error(errorMessages.ADDRESS_COUNTRY_INVALID_CHARACTERS + invalidChar);
            }
            return true;
        }),
];

const route = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    const firstName: string = req.body[FIRST_NAME_FIELD];
    const lastName: string = req.body[LAST_NAME_FIELD];
    const addressLineOne: string = req.body[ADDRESS_LINE_ONE_FIELD];
    const addressLineTwo: string = req.body[ADDRESS_LINE_TWO_FIELD];
    const addressTown: string = req.body[ADDRESS_TOWN_FIELD];
    const addressCounty: string = req.body[ADDRESS_COUNTY_FIELD];
    const addressPostcode: string = req.body[ADDRESS_POSTCODE_FIELD];
    const addressCountry: string = req.body[ADDRESS_COUNTRY_FIELD];
    if (!errors.isEmpty()) {
        let addressCountyError;
        let addressCountryError;
        let addressLineOneError;
        let addressLineTwoError;
        let addressPostcodeError;
        let addressTownError;
        let firstNameError;
        let lastNameError;
        const errorList = errors.array({ onlyFirstError: true }).map((error) => {
            const govUkErrorData: GovUkErrorData = createGovUkErrorData(error.msg, "#" + error.param, true, "");
            switch (error.param) {
                case FIRST_NAME_FIELD:
                    firstNameError = govUkErrorData;
                    break;
                case LAST_NAME_FIELD:
                    lastNameError = govUkErrorData;
                    break;
                case ADDRESS_LINE_ONE_FIELD:
                    addressLineOneError = govUkErrorData;
                    break;
                case ADDRESS_LINE_TWO_FIELD:
                    addressLineTwoError = govUkErrorData;
                    break;
                case ADDRESS_TOWN_FIELD:
                    addressTownError = govUkErrorData;
                    break;
                case ADDRESS_COUNTY_FIELD:
                    addressCountyError = govUkErrorData;
                    break;
                case ADDRESS_POSTCODE_FIELD:
                    addressPostcodeError = govUkErrorData;
                    break;
                case ADDRESS_COUNTRY_FIELD:
                        addressCountryError = govUkErrorData;
                        break;
            }
            if (error.msg === errorMessages.ADDRESS_COUNTY_AND_POSTCODE_EMPTY) {
                addressCountyError = createGovUkErrorData(errorMessages.ADDRESS_COUNTY_EMPTY, "#" + error.param, true, "");
                addressPostcodeError = createGovUkErrorData(
                    errorMessages.ADDRESS_POSTCODE_EMPTY, "#" + error.param, true, "");
            }
            return govUkErrorData;
        });

        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);

        return res.render(templatePaths.DELIVERY_DETAILS, {
            addressCountry,
            addressCountryError,
            addressCounty,
            addressCountyError,
            addressLineOne,
            addressLineOneError,
            addressLineTwo,
            addressLineTwoError,
            addressPostcode,
            addressPostcodeError,
            addressTown,
            addressTownError,
            companyNumber: certificateItem.companyNumber,
            errorList,
            firstName,
            firstNameError,
            lastName,
            lastNameError,
            templateName: (templatePaths.DELIVERY_DETAILS),
        });
    }
    res.redirect(templatePaths.CHECK_DETAILS);
};

export default [...validators, route];
