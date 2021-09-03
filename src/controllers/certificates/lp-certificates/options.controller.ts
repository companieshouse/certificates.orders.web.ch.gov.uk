import { Request, Response, NextFunction } from "express";
import { CertificateItemPatchRequest, ItemOptionsRequest, CertificateItem, ItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { patchCertificateItem, getCertificateItem } from "../../../client/api.client";
import { createLogger } from "ch-structured-logging";
import { LP_CERTIFICATE_OPTIONS } from "../../../model/template.paths";
import { getAccessToken, getUserId } from "../../../session/helper";
import { APPLICATION_NAME } from "../../../config/config";

const GOOD_STANDING_FIELD: string = "goodStanding";
const PRINCIPLE_PLACE_OF_BUSINESS_FIELD: string = "principlePlaceOfBusiness";
const GENERAL_PARTNERS_FIELD: string = "generalPartners";
const LIMITED_PARTNERS_FIELD: string = "limitedPartners";
const GENERAL_NATURE_OF_BUSINESS_FIELD: string = "generalNatureOfBusinessField";
const MORE_INFO_FIELD: string = "moreInfo";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const itemOptions: ItemOptions = certificateItem.itemOptions;
        const SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/certificates`;
        logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        return res.render(LP_CERTIFICATE_OPTIONS, {
            companyNumber: certificateItem.companyNumber,
            itemOptions: certificateItem.itemOptions,
            templateName: LP_CERTIFICATE_OPTIONS,
            SERVICE_URL
        });
    } catch (err) {
        logger.error(`Error retrieving certificate item, ${err}`);
        next(err);
    }
};

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const moreInfo: string[] = typeof req.body[MORE_INFO_FIELD] === "string" ? [req.body[MORE_INFO_FIELD]] : req.body[MORE_INFO_FIELD];
        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                ...setItemOptions(moreInfo)
            },
            quantity: 1
        };
        const accessToken: string = getAccessToken(req.session);
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with certificate options, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);

        if (hasOption(moreInfo, PRINCIPLE_PLACE_OF_BUSINESS_FIELD)) {
            return res.redirect("principle-place-of-business-options");
        } else {
            return res.redirect("delivery-details");
        }
    } catch (err) {
        logger.error(`${err}`);
        return next(err);
    }
};

export const setItemOptions = (options: string[]): ItemOptionsRequest => {
    const initialItemOptions: ItemOptionsRequest = {
        generalPartnerDetails: {
            includeBasicInformation: null
        },
        includeCompanyObjectsInformation: null,
        includeGoodStandingInformation: null,
        limitedPartnerDetails: {
            includeBasicInformation: null
        },
        principlePlaceOfBusinessDetails: {
            includeAddressRecordsType: null
        }
    };
    return options === undefined ? initialItemOptions
        : options.reduce((itemOptionsAccum: ItemOptionsRequest, option: string) => {
            switch (option) {
            case GOOD_STANDING_FIELD: {
                itemOptionsAccum.includeGoodStandingInformation = true;
                break;
            }
            case PRINCIPLE_PLACE_OF_BUSINESS_FIELD: {
                itemOptionsAccum.principlePlaceOfBusinessDetails = { includeAddressRecordsType: "current" };
                break;
            }
            case GENERAL_PARTNERS_FIELD: {
                itemOptionsAccum.generalPartnerDetails = { includeBasicInformation: true };
                break;
            }
            case LIMITED_PARTNERS_FIELD: {
                itemOptionsAccum.limitedPartnerDetails = { includeBasicInformation: true };
                break;
            }
            case GENERAL_NATURE_OF_BUSINESS_FIELD: {
                logger.debug("General nature of business field not handled");
                break;
            }
            default:
                break;
            }
            return itemOptionsAccum;
        }, initialItemOptions);
};

export const hasOption = (options: string[], requiredOption: string): boolean => {
    if (options === undefined) {
        return false;
    }
    for (const providedOption of options) {
        if (providedOption === requiredOption) {
            return true;
        }
    }
    return false;
};