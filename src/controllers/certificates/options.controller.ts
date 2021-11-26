import { Request, Response, NextFunction } from "express";
import { CertificateItemPatchRequest, ItemOptionsRequest, CertificateItem, ItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { patchCertificateItem, getCertificateItem, getCompanyProfile } from "../../client/api.client";
import { createLogger } from "ch-structured-logging";
import { CERTIFICATE_OPTIONS } from "../../model/template.paths";
import { getAccessToken, getUserId } from "../../session/helper";
import { APPLICATION_NAME, API_KEY } from "../../config/config";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile";
import { optionFilter } from "./OptionFilter";

const GOOD_STANDING_FIELD: string = "goodStanding";
const REGISTERED_OFFICE_FIELD: string = "registeredOffice";
const DIRECTORS_FIELD: string = "directors";
const SECRETARIES_FIELD: string = "secretaries";
const COMPANY_OBJECTS_FIELD: string = "companyObjects";
const MORE_INFO_FIELD: string = "moreInfo";
const LIQUIDATORS_FIELD: string = "liquidators";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, certificateItem.companyNumber);
        const itemOptions: ItemOptions = certificateItem.itemOptions;
        const SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/certificates`;
        logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        return res.render(CERTIFICATE_OPTIONS, {
            companyNumber: certificateItem.companyNumber,
            itemOptions: certificateItem.itemOptions,
            templateName: CERTIFICATE_OPTIONS,
            SERVICE_URL,
            filterMappings: {
                goodStanding: companyProfile.companyStatus != 'liquidation',
                liquidators: companyProfile.companyStatus == 'liquidation'
            },
            optionFilter: optionFilter
        });
    } catch (err) {
        logger.error(`Error retrieving certificate item, ${err}`);
        next(err);
    }
};

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const moreInfo: string[] | string = req.body[MORE_INFO_FIELD];
        let additionalInfoItemOptions: ItemOptionsRequest;
        let registeredOfficeOptions: boolean;
        let directorOptions: boolean;
        let secretaryOptions: boolean;
        const accessToken: string = getAccessToken(req.session);
        const certificate: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const companyProfile: CompanyProfile = await getCompanyProfile(API_KEY, certificate.companyNumber);

        if (typeof moreInfo === "string") {
            additionalInfoItemOptions = setItemOptions(companyProfile.companyStatus, [moreInfo]);
            registeredOfficeOptions = hasRegisterOfficeAddressOptions([moreInfo]);
            directorOptions = hasDirectorOption([moreInfo]);
            secretaryOptions = hasSecretaryOptions([moreInfo]);
        } else {
            additionalInfoItemOptions = setItemOptions(companyProfile.companyStatus, moreInfo);
            registeredOfficeOptions = hasRegisterOfficeAddressOptions(moreInfo);
            directorOptions = hasDirectorOption(moreInfo);
            secretaryOptions = hasSecretaryOptions(moreInfo);
        }

        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                ...additionalInfoItemOptions
            },
            quantity: 1
        };
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with certificate options, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);

        if (registeredOfficeOptions) {
            return res.redirect("registered-office-options");
        } else if (directorOptions) {
            return res.redirect("director-options");
        } else if (secretaryOptions) {
            return res.redirect("secretary-options");
        } else {
            return res.redirect("delivery-details");
        }
    } catch (err) {
        logger.error(`${err}`);
        return next(err);
    }
};

export const setItemOptions = (companyStatus: string, options?: string[]): ItemOptionsRequest => {
    const initialItemOptions: ItemOptionsRequest = {
        directorDetails: {
            includeBasicInformation: null,
            includeAddress: null,
            includeAppointmentDate: null,
            includeCountryOfResidence: null,
            includeDobType: null,
            includeNationality: null,
            includeOccupation: null
        },
        includeCompanyObjectsInformation: null,
        includeGoodStandingInformation: null,
        registeredOfficeAddressDetails: {
            includeAddressRecordsType: null
        },
        secretaryDetails: {
            includeBasicInformation: null,
            includeAddress: null,
            includeAppointmentDate: null
        },
    };
    if(companyStatus === "liquidation") {
        initialItemOptions.liquidatorsDetails = { includeBasicInformation: null };
    }
    return options === undefined ? initialItemOptions
        : options.reduce((itemOptionsAccum: ItemOptionsRequest, option: string) => {
            switch (option) {
            case GOOD_STANDING_FIELD: {
                itemOptionsAccum.includeGoodStandingInformation = true;
                break;
            }
            case REGISTERED_OFFICE_FIELD: {
                itemOptionsAccum.registeredOfficeAddressDetails = {};
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
            case LIQUIDATORS_FIELD: {
                //if(companyStatus === "liquidation" && FEATURE_FLAGS.liquidatedCompanyCertificatesEnabled()){
                if(companyStatus === "liquidation"){
                    itemOptionsAccum.liquidatorsDetails = { includeBasicInformation: true };
                }
                break;
            }
            default:
                break;
            }
            return itemOptionsAccum;
        }, initialItemOptions);
};

export const hasRegisterOfficeAddressOptions = (options: string[]): boolean => {
    if (options === undefined) {
        return false;
    }
    for (const option of options) {
        if (option === REGISTERED_OFFICE_FIELD) {
            return true;
        }
    }
    return false;
};

export const hasDirectorOption = (options: string[]): boolean => {
    if (options === undefined) {
        return false;
    }
    for (const option of options) {
        if (option === DIRECTORS_FIELD) {
            return true;
        }
    }
    return false;
};

export const hasSecretaryOptions = (options: string[]): boolean => {
    if (options === undefined) {
        return false;
    }
    for (const option of options) {
        if (option === SECRETARIES_FIELD) {
            return true;
        }
    }
    return false;
};
