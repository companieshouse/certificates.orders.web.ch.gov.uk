import {Request, Response, NextFunction} from "express";
import {CertificateItemPostRequest, ItemOptionsRequest} from "ch-sdk-node/dist/services/order/item/certificate/types";
import {postCertificateItem} from "../client/api.client";

import {ORDER_DETAILS} from "../model/template.paths";
import {getAccessToken} from "../session/helper";

const GOOD_STANDING_FIELD: string = "goodStanding";
const REGISTERED_OFFICE_FIELD: string = "registeredOffice";
const DIRECTORS_FIELD: string = "directors";
const SECRETARIES_FIELD: string = "secretaries";
const COMPANY_OBJECTS_FIELD: string = "companyObjects";
const MORE_INFO_FIELD: string = "moreInfo";

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const moreInfo: string[] | string = req.body[MORE_INFO_FIELD];
        let additionalInfoItemOptions: ItemOptionsRequest;
        if (typeof moreInfo === "string") {
            additionalInfoItemOptions = setItemOptions([moreInfo]);
        } else {
            additionalInfoItemOptions = setItemOptions(moreInfo);
        }

        const certificateItem: CertificateItemPostRequest = {
            companyNumber: req.params.companyNumber,
            itemOptions: {
                certificateType: "incorporation-with-all-name-changes",
                collectionLocation: "cardiff",
                deliveryTimescale: "standard",
                ...additionalInfoItemOptions,
            },
            quantity: 1,
        };
        const accessToken: string = getAccessToken(req.session);
        //await postCertificateItem(accessToken, certificateItem);

        return res.redirect(ORDER_DETAILS);
    } catch (err) {
        return next(err);
    }
};

export const setItemOptions = (options: string[]): ItemOptionsRequest => {
    const initialItemOptions: ItemOptionsRequest = {
        directorDetails: {
            includeBasicInformation: null,
        },
        includeCompanyObjectsInformation: null,
        includeGoodStandingInformation: null,
        registeredOfficeAddressDetails: {
            includeAddressRecordsType: null,
        },
        secretaryDetails: {
            includeBasicInformation: null,
        },
    };
    return options === undefined ? initialItemOptions :
        options.reduce((itemOptionsAccum: ItemOptionsRequest, option: string) => {
        switch (option) {
            case GOOD_STANDING_FIELD: {
                itemOptionsAccum.includeGoodStandingInformation = true;
                break;
            }
            case REGISTERED_OFFICE_FIELD: {
                itemOptionsAccum.registeredOfficeAddressDetails = { includeAddressRecordsType: "current" };
                break;
            }
            case DIRECTORS_FIELD: {
                itemOptionsAccum.directorDetails = { includeBasicInformation: true };
                break;
            }
            case SECRETARIES_FIELD: {
                itemOptionsAccum.secretaryDetails = { includeBasicInformation: true };
                break;
            }
            case COMPANY_OBJECTS_FIELD: {
                itemOptionsAccum.includeCompanyObjectsInformation = true;
                break;
            }
            default:
                break;
        }
        return itemOptionsAccum;
    }, initialItemOptions);
};
