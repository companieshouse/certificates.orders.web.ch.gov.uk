import { NextFunction, Request, Response } from "express";
import { CertificateItem, ItemOptions, DesignatedMemberDetails, MemberDetails } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { createLogger } from "ch-structured-logging";

import {
    DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, LLP_CERTIFICATE_DELIVERY_DETAILS,
    LLP_CERTIFICATE_OPTIONS, LLP_ROOT_CERTIFICATE, replaceCertificateId,
    replaceCompanyNumber, ROOT_DISSOLVED_CERTIFICATE
} from "../../../model/page.urls";
import { mapDeliveryDetails, mapToHtml, mapDeliveryMethod } from "../../../utils/check.details.utils";
import { LLP_CERTIFICATE_CHECK_DETAILS } from "../../../model/template.paths";
import { addItemToBasket, getCertificateItem, getBasket } from "../../../client/api.client";
import { CHS_URL, APPLICATION_NAME } from "../../../config/config";
import { getAccessToken, getUserId } from "../../../session/helper";
import {DobType} from "../../../model/DobType";

const logger = createLogger(APPLICATION_NAME);

export const isOptionSelected = (itemOption: Boolean | undefined) : string => {
    if (itemOption === undefined) {
        return "No";
    } else {
        return "Yes";
    }
};

const setChangeDeliveryDetails = (certificateItem: CertificateItem) => {
    return (certificateItem.itemOptions?.certificateType !== "dissolution")
        ? replaceCertificateId(LLP_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id) : replaceCertificateId(DISSOLVED_CERTIFICATE_DELIVERY_DETAILS, certificateItem.id);
};

const setServiceUrl = (certificateItem: CertificateItem) => {
    return (certificateItem.itemOptions?.certificateType !== "dissolution")
        ? replaceCompanyNumber(LLP_ROOT_CERTIFICATE, certificateItem.companyNumber) : replaceCompanyNumber(ROOT_DISSOLVED_CERTIFICATE, certificateItem.companyNumber);
}

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const itemOptions: ItemOptions = certificateItem.itemOptions;
        const basket: Basket = await getBasket(accessToken);
        const isNotDissolutionCertificateType: Boolean = itemOptions.certificateType !== "dissolution";
        const includeAddressRecordsType: string | undefined = itemOptions.registeredOfficeAddressDetails?.includeAddressRecordsType;

        return res.render(LLP_CERTIFICATE_CHECK_DETAILS, {
            companyName: certificateItem.companyName,
            companyNumber: certificateItem.companyNumber,
            certificateType: mapCertificateType(itemOptions.certificateType),
            deliveryMethod: mapDeliveryMethod(itemOptions),
            fee: applyCurrencySymbol(certificateItem.itemCosts[0].itemCost),
            changeIncludedOn: replaceCertificateId(LLP_CERTIFICATE_OPTIONS, req.params.certificateId),
            changeDeliveryDetails: setChangeDeliveryDetails(certificateItem),
            deliveryDetails: mapDeliveryDetails(basket.deliveryDetails),
            SERVICE_URL: setServiceUrl(certificateItem),
            isNotDissolutionCertificateType,
            templateName: LLP_CERTIFICATE_CHECK_DETAILS,
            statementOfGoodStanding: isOptionSelected(itemOptions.includeGoodStandingInformation),
            currentDesignatedMembersNames: mapDesignatedMembersOptions(itemOptions.designatedMemberDetails),
            currentMembersNames: mapMembersOptions(itemOptions.memberDetails),
            registeredOfficeAddress: mapRegisteredOfficeAddress(includeAddressRecordsType)
        });
    } catch (err) {
        logger.error(`${err}`);
        next(err);
    }
};

const route = async (req: Request, res: Response, next: NextFunction) => {
    // add item to basket
    // then redirect
    try {
        const accessToken: string = getAccessToken(req.session);
        const certificateId: string = req.params.certificateId;
        const userId = getUserId(req.session);
        const resp = await addItemToBasket(
            accessToken,
            { itemUri: `/orderable/certificates/${certificateId}` });
        logger.info(`item added to basket certificate_id=${certificateId}, user_id=${userId}, company_number=${resp.companyNumber}, redirecting to basket`);
        res.redirect(`${CHS_URL}/basket`);
    } catch (error) {
        logger.error(`error=${error}`);
        return next(error);
    }
};

export const mapCertificateType = (certificateType: string): string => {
    if (certificateType === "incorporation-with-all-name-changes") {
        return "Incorporation with all company name changes";
    } else if (certificateType === "dissolution") {
        return "Dissolution with all company name changes";
    }

    const typeCapitalised = certificateType.charAt(0).toUpperCase() +
    certificateType.slice(1);

    return typeCapitalised.replace(/-/g, " ");
};

export const applyCurrencySymbol = (fee: string): string => {
    return "£" + fee;
};

export const mapRegisteredOfficeAddress = (registeredOfficeAddress: string | undefined): string => {
    switch (registeredOfficeAddress) {
    case "current":
        return "Current address";
    case "current-and-previous":
        return "Current address and the one previous";
    case "current-previous-and-prior":
        return "Current address and the two previous";
    case "all":
        return "All current and previous addresses";
    default:
        return "No";
    };
};

export const mapDesignatedMembersOptions = (designatedMembersOptions?: DesignatedMemberDetails): string => {
    if (designatedMembersOptions === undefined || designatedMembersOptions.includeBasicInformation === undefined) {
        return "No";
    }

    if (designatedMembersOptions.includeBasicInformation === true &&
        designatedMembersOptions.includeAddress === false &&
        designatedMembersOptions.includeAppointmentDate === false &&
        designatedMembersOptions.includeCountryOfResidence === false &&
        designatedMembersOptions.includeDobType === undefined) {
        return "Yes";
    }

    const designatedMembersMappings:string[] = [];
    designatedMembersMappings.push("Including designated members':");

    if (designatedMembersOptions.includeAddress) {
        designatedMembersMappings.push("Correspondence address");
    }

    if (designatedMembersOptions.includeAppointmentDate) {
        designatedMembersMappings.push("Appointment date");
    }

    if (designatedMembersOptions.includeCountryOfResidence) {
        designatedMembersMappings.push("Country of residence");
    }

    if (designatedMembersOptions.includeDobType === DobType.PARTIAL ||
    designatedMembersOptions.includeDobType === DobType.FULL) {
        designatedMembersMappings.push("Date of birth (month and year)");
    }

    return mapToHtml(designatedMembersMappings);
};

export const mapMembersOptions = (memberOptions?: MemberDetails): string => {
    if (memberOptions === undefined || memberOptions.includeBasicInformation === undefined) {
        return "No";
    }

    if (memberOptions.includeBasicInformation === true &&
        memberOptions.includeAddress === false &&
        memberOptions.includeAppointmentDate === false &&
        memberOptions.includeCountryOfResidence === false &&
        memberOptions.includeDobType === undefined) {
        return "Yes";
    }

    const membersMappings:string[] = [];
    membersMappings.push("Including members':");

    if (memberOptions.includeAddress) {
        membersMappings.push("Correspondence address");
    }

    if (memberOptions.includeAppointmentDate) {
        membersMappings.push("Appointment date");
    }

    if (memberOptions.includeCountryOfResidence) {
        membersMappings.push("Country of residence");
    }

    if (memberOptions.includeDobType === "partial" ||
    memberOptions.includeDobType === "full") {
        membersMappings.push("Date of birth (month and year)");
    }

    return mapToHtml(membersMappings);
};

export default [route];
