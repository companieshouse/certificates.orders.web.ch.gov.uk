import {NextFunction, Request, Response} from "express";
import {check, validationResult} from "express-validator";
import {createGovUkErrorData, GovUkErrorData} from "../model/govuk.error.data";
import * as errorMessages from "../model/error.messages";
import * as templatePaths from "../model/template.paths";
import {validateCharSet} from "../utils/char-set";

const FIRST_NAME_FIELD: string = "firstName";
const LAST_NAME_FIELD: string = "lastName";

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
];

const route = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    const firstName: string = req.body[FIRST_NAME_FIELD];
    const lastName: string = req.body[LAST_NAME_FIELD];
    if (!errors.isEmpty()) {
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
            }
            return govUkErrorData;
        });

        return res.render(templatePaths.ORDER_DETAILS, {
            errorList,
            firstName,
            firstNameError,
            lastName,
            lastNameError,
            templateName: (templatePaths.ORDER_DETAILS),
        });
    }
    return res.redirect(templatePaths.GOOD_STANDING);
};

export default [...validators, route];
