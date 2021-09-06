import { Request, Response, NextFunction } from "express";
import { CertificateItemPatchRequest, ItemOptionsRequest, CertificateItem, ItemOptions } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { patchCertificateItem, getCertificateItem } from "../../../client/api.client";
import { createLogger } from "ch-structured-logging";
import { LLP_CERTIFICATE_OPTIONS } from "../../../model/template.paths";
import { getAccessToken, getUserId } from "../../../session/helper";
import { APPLICATION_NAME } from "../../../config/config";
import { replaceCompanyNumber, LLP_ROOT_CERTIFICATE } from "../../../model/page.urls";

const GOOD_STANDING_FIELD: string = "goodStanding";
const REGISTERED_OFFICE_FIELD: string = "registeredOffice";
const DESIGNATED_MEMBERS_FIELD: string = "designatedMembers";
const MEMBERS_FIELD: string = "members";
const MORE_INFO_FIELD: string = "moreInfo";

const logger = createLogger(APPLICATION_NAME);

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = getUserId(req.session);
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const itemOptions: ItemOptions = certificateItem.itemOptions;
        const SERVICE_URL = replaceCompanyNumber(LLP_ROOT_CERTIFICATE, certificateItem.companyNumber)
        logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
        return res.render(LLP_CERTIFICATE_OPTIONS, {
            companyNumber: certificateItem.companyNumber,
            itemOptions: certificateItem.itemOptions,
            templateName: LLP_CERTIFICATE_OPTIONS,
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

        if (hasOption(moreInfo, REGISTERED_OFFICE_FIELD)) {
            return res.redirect("registered-office-options");
        } else if (hasOption(moreInfo, DESIGNATED_MEMBERS_FIELD)) {
            return res.redirect("designated-member-options");
        } else if (hasOption(moreInfo, MEMBERS_FIELD)) {
            return res.redirect("member-options");
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
        designatedMemberDetails: {
            includeAddress: null,
            includeAppointmentDate: null,
            includeBasicInformation: null,
            includeCountryOfResidence: null,
            includeDobType: null
        },
        includeCompanyObjectsInformation: null,
        includeGoodStandingInformation: null,
        memberDetails: {
            includeAddress: null,
            includeAppointmentDate: null,
            includeBasicInformation: null,
            includeCountryOfResidence: null,
            includeDobType: null
        },
        registeredOfficeAddressDetails: {
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
            case REGISTERED_OFFICE_FIELD: {
                itemOptionsAccum.registeredOfficeAddressDetails = { includeAddressRecordsType: "current" };
                break;
            }
            case DESIGNATED_MEMBERS_FIELD: {
                itemOptionsAccum.designatedMemberDetails = { includeBasicInformation: true };
                break;
            }
            case MEMBERS_FIELD: {
                itemOptionsAccum.memberDetails = { includeBasicInformation: true };
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