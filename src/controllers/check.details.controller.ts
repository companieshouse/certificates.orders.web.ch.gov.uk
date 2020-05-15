import { getAccessToken } from "../session/helper";
import { NextFunction, Request, Response } from "express";
import { addItemToBasket } from "../client/api.client";
import { CHS_URL } from "../session/config";
import { CertificateItem , ItemOptions} from "ch-sdk-node/dist/services/order/item/certificate/types";
import { CHECK_DETAILS } from "../model/template.paths";
import { getCertificateItem , getBasket} from "../client/api.client";
import { CERTIFICATE_OPTIONS , DELIVERY_DETAILS , replaceCertificateId} from "../model/page.urls";
import { Basket, DeliveryDetails } from "ch-sdk-node/dist/services/order/basket/types";

const GOOD_STANDING = "Statement of good standing";
const COMPANY_OBJECTS = "Company objects";

export const render = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const accessToken: string = getAccessToken(req.session);
        const certificateItem: CertificateItem = await getCertificateItem(accessToken, req.params.certificateId);
        const itemOptions: ItemOptions = certificateItem.itemOptions;
        const basket: Basket = await getBasket(accessToken);

        return res.render(CHECK_DETAILS, {
            companyName: certificateItem.companyName,
            companyNumber: certificateItem.companyNumber,
            certificateType: mapCertificateType(itemOptions.certificateType),
            fee: applyCurrencySymbol(certificateItem.itemCosts[0].itemCost),
            certificateMappings: mapIncludedOnCertificate(certificateItem.itemOptions),
            changeIncludedOn: replaceCertificateId(CERTIFICATE_OPTIONS, req.params.certificateId),
            changedeliveryDetails: replaceCertificateId(DELIVERY_DETAILS, req.params.certificateId),
            deliveryDetails: mapDeliveryDetails(basket.deliveryDetails),
            templateName: CHECK_DETAILS,
        });
    } catch (err) {
        next(err);
    }
};

const route = async (req: Request, res: Response, next:  NextFunction) => {

    // add item to basket
    // then redirect
    try {
        const accessToken: string = getAccessToken(req.session);
        const certificateId: string = req.params.certificateId;

        const resp = await addItemToBasket(
            accessToken,
            { itemUri: `/orderable/certificates/${certificateId}` });
        res.redirect(`${CHS_URL}/basket`);
    } catch (error) {
        return next(error);
    }
};

function mapIncludedOnCertificate(itemOptions: ItemOptions): string {

    let mappings = new Array<string>();

    if (itemOptions.includeGoodStandingInformation) {
        mappings.push(GOOD_STANDING)
    }

    if (itemOptions.includeCompanyObjectsInformation) {
        mappings.push(COMPANY_OBJECTS);
    }

    return mapToHtml(mappings);
}

function mapDeliveryDetails(deliveryDetails: DeliveryDetails | undefined): string {

    let mappings = new Array<string>();

    if (deliveryDetails == undefined) {
        return "";
    }

    mappings.push(deliveryDetails.forename + " " + deliveryDetails.surname);
    mappings.push(deliveryDetails.addressLine1);

    if (deliveryDetails.addressLine2 != "" && deliveryDetails.addressLine2 != undefined) {
        mappings.push(deliveryDetails.addressLine2);
    }

    mappings.push(deliveryDetails.locality);

    if (deliveryDetails.region != "" && deliveryDetails.region != undefined) {
        mappings.push(deliveryDetails.region);
    }

    if (deliveryDetails.postalCode != "" && deliveryDetails.postalCode != undefined) {
        mappings.push(deliveryDetails.postalCode);
    }

    mappings.push(deliveryDetails.country);

    return mapToHtml(mappings);
}

function mapToHtml(mappings: Array<string>): string {
    let htmlString: string = "";

    mappings.forEach(element => {
        htmlString += element + "<br>";
    });
    return htmlString;
}

function mapCertificateType(certificateType: string): string {
    const typeCapitalised = certificateType.charAt(0).toUpperCase()
    + certificateType.slice(1);

    return typeCapitalised.replace(/-/g, " ");
}

function applyCurrencySymbol(fee: string):string {
    return "£" + fee;
}

export default [route];