import { NextFunction, Request, Response } from "express";
import { getAccessToken, getUserId } from "../../session/helper";
import { CertificateItem, ItemOptions, DirectorOrSecretaryDetails, DirectorOrSecretaryDetailsRequest, CertificateItemPatchRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem, patchCertificateItem } from "../../client/api.client";
import { CERTIFICATE_DIRECTOR_OPTIONS } from "../../model/template.paths";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../config/config";

const logger = createLogger(APPLICATION_NAME);
const INCLUDE_ADDRESS_FIELD: string = "address";
const INCLUDE_APPOINTMENT_DATE_FIELD: string = "appointment";
const INCLUDE_COUNTRY_OF_RESIDENCE_FIELD: string = "countryOfResidence";
const INCLUDE_DOB_TYPE_FIELD: string = "dob";
const INCLUDE_NATIONALITY_FIELD: string = "nationality";
const INCLUDE_OCCUPATION_FIELD: string = "occupation";
const DIRECTOR_OPTIONS_FIELD: string = "directorOptions";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const itemOptions: ItemOptions = certificateItem.itemOptions;
    const SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/certificates`;
    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
    return res.render(CERTIFICATE_DIRECTOR_OPTIONS, {
        companyNumber: certificateItem.companyNumber,
        itemOptions: certificateItem.itemOptions,
        directorDetails: itemOptions.directorDetails,
        SERVICE_URL,
        backLink: setBackLink(certificateItem)
    });
};

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const directorOption: string[] | string = req.body[DIRECTOR_OPTIONS_FIELD];
        let directorOptionSelected: DirectorOrSecretaryDetailsRequest;

        if (typeof directorOption === "string") {
            directorOptionSelected = setDirectorOption([directorOption]);
        } else {
            directorOptionSelected = setDirectorOption(directorOption);
        }

        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                directorDetails: {
                    ...directorOptionSelected
                }
            }
        };
        const accessToken: string = getAccessToken(req.session);
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with registered office option, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);
        return res.redirect("delivery-details");
    } catch (err) {
        logger.error(`{$err}`);
        return next(err);
    }
};

export const setDirectorOption = (options: string[]): DirectorOrSecretaryDetailsRequest => {
    const inititalDirectorOptions: DirectorOrSecretaryDetailsRequest = {
        includeAddress: false,
        includeAppointmentDate: false,
        includeBasicInformation: true,
        includeCountryOfResidence: false,
        includeDobType: null,
        includeNationality: false,
        includeOccupation: false
    };
    return options === undefined ? inititalDirectorOptions
        : options.reduce((directorOptionsAccum: DirectorOrSecretaryDetailsRequest, option: string) => {
            switch (option) {
            case INCLUDE_ADDRESS_FIELD: {
                directorOptionsAccum.includeAddress = true;
                break;
            }
            case INCLUDE_APPOINTMENT_DATE_FIELD: {
                directorOptionsAccum.includeAppointmentDate = true;
                break;
            }
            case INCLUDE_COUNTRY_OF_RESIDENCE_FIELD: {
                directorOptionsAccum.includeCountryOfResidence = true;
                break;
            }
            case INCLUDE_DOB_TYPE_FIELD: {
                directorOptionsAccum.includeDobType = "partial";
                break;
            }
            case INCLUDE_NATIONALITY_FIELD: {
                directorOptionsAccum.includeNationality = true;
                break;
            }
            case INCLUDE_OCCUPATION_FIELD: {
                directorOptionsAccum.includeOccupation = true;
                break;
            }
            default:
                break;
            }
            return directorOptionsAccum;
        }, inititalDirectorOptions);
};

export const setBackLink = (certificateItem: CertificateItem) => {
    let backLink;

    if (certificateItem.itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType) {
        backLink = "registered-office-options";
    } else {
        backLink = "certificate-options";
    }
    return backLink;
};
