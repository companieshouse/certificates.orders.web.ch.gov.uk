import { NextFunction, Request, Response } from "express";
import { getAccessToken, getUserId } from "../../../session/helper";
import { CertificateItem, ItemOptions, DirectorOrSecretaryDetails, DirectorOrSecretaryDetailsRequest, CertificateItemPatchRequest, DesignatedMemberDetailsRequest } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { getCertificateItem, patchCertificateItem } from "../../../client/api.client";
import { LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS } from "../../../model/template.paths";
import { createLogger } from "ch-structured-logging";
import { APPLICATION_NAME } from "../../../config/config";
import { Session } from "@companieshouse/node-session-handler/lib/session/model/Session";
import CertificateSessionData from "../../../session/CertificateSessionData";

const logger = createLogger(APPLICATION_NAME);
const INCLUDE_ADDRESS_FIELD: string = "address";
const INCLUDE_APPOINTMENT_DATE_FIELD: string = "appointment";
const INCLUDE_COUNTRY_OF_RESIDENCE_FIELD: string = "countryOfResidence";
const INCLUDE_DOB_TYPE_FIELD: string = "dob";
const DESIGNATED_MEMBER_OPTIONS_FIELD: string = "designatedMemberOptions";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = getUserId(req.session);
    const accessToken: string = getAccessToken(req.session);
    const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
    const itemOptions: ItemOptions = certificateItem.itemOptions;
    const SERVICE_URL = `/company/${certificateItem.companyNumber}/orderable/certificates`;
    logger.info(`Certificate item retrieved, id=${certificateItem.id}, user_id=${userId}, company_number=${certificateItem.companyNumber}`);
    return res.render(LLP_CERTIFICATE_DESIGNATED_MEMBERS_OPTIONS, {
        designatedMemberDetails: itemOptions.designatedMemberDetails,
        SERVICE_URL,
        backLink: setBackLink(certificateItem, req.session)
    });
};

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        const designatedMemberOption: string[] | string = req.body[DESIGNATED_MEMBER_OPTIONS_FIELD];
        let designatedMemberOptionSelected: DesignatedMemberDetailsRequest;

        if (typeof designatedMemberOption === "string") {
            designatedMemberOptionSelected = setDesignatedMemberOption([designatedMemberOption]);
        } else {
            designatedMemberOptionSelected = setDesignatedMemberOption(designatedMemberOption);
        }

        const certificateItem: CertificateItemPatchRequest = {
            itemOptions: {
                designatedMemberDetails: {
                    ...designatedMemberOptionSelected
                }
            }
        };
        const accessToken: string = getAccessToken(req.session);
        const userId = getUserId(req.session);
        const patchResponse = await patchCertificateItem(accessToken, req.params.certificateId, certificateItem);
        logger.info(`Patched certificate item with designated member options, id=${req.params.certificateId}, user_id=${userId}, company_number=${patchResponse.companyNumber}, certificate_options=${JSON.stringify(certificateItem)}`);
        if (patchResponse.itemOptions.memberDetails) {
            return res.redirect("member-options");
        } else {
            return res.redirect("delivery-details");
        }
    } catch (err) {
        logger.error(`{$err}`);
        return next(err);
    }
};

export const setDesignatedMemberOption = (options: string[]): DesignatedMemberDetailsRequest => {
    const initialDesignatedMemberOptions: DesignatedMemberDetailsRequest = {
        includeAddress: false,
        includeAppointmentDate: false,
        includeBasicInformation: true,
        includeCountryOfResidence: false,
        includeDobType: null
    };
    return options === undefined ? initialDesignatedMemberOptions
        : options.reduce((designMemberOptionAccum: DesignatedMemberDetailsRequest, option: string) => {
            switch (option) {
            case INCLUDE_ADDRESS_FIELD: {
                designMemberOptionAccum.includeAddress = true;
                break;
            }
            case INCLUDE_APPOINTMENT_DATE_FIELD: {
                designMemberOptionAccum.includeAppointmentDate = true;
                break;
            }
            case INCLUDE_COUNTRY_OF_RESIDENCE_FIELD: {
                designMemberOptionAccum.includeCountryOfResidence = true;
                break;
            }
            case INCLUDE_DOB_TYPE_FIELD: {
                designMemberOptionAccum.includeDobType = "partial";
                break;
            }
            default:
                break;
            }
            return designMemberOptionAccum;
        }, initialDesignatedMemberOptions);
};

export const setBackLink = (certificateItem: CertificateItem, session: Session | undefined) => {
    let backLink;

    if (certificateItem.itemOptions?.registeredOfficeAddressDetails?.includeAddressRecordsType) {
        return (session?.getExtraData("certificates-orders-web-ch-gov-uk") as CertificateSessionData)?.isFullPage ? "registered-office-options?layout=full" : "registered-office-options";
    } else {
        backLink = "llp-certificate-options";
    }
    return backLink;
};
