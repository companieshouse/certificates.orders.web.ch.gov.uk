import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { DISPATCH_DAYS } from "../config/config";

const dispatchDays: string = DISPATCH_DAYS;

export const mapDeliveryDetails = (deliveryDetails: DeliveryDetails | undefined): string => {
    const mappings:string[] = [];

    if (deliveryDetails === undefined) {
        return "";
    }

    mappings.push(deliveryDetails.forename + " " + deliveryDetails.surname);
    mappings.push(deliveryDetails.addressLine1);

    if (deliveryDetails.addressLine2 !== "" && deliveryDetails.addressLine2 !== undefined) {
        mappings.push(deliveryDetails.addressLine2);
    }

    mappings.push(deliveryDetails.locality);

    if (deliveryDetails.region !== "" && deliveryDetails.region !== undefined) {
        mappings.push(deliveryDetails.region);
    }

    if (deliveryDetails.postalCode !== "" && deliveryDetails.postalCode !== undefined) {
        mappings.push(deliveryDetails.postalCode);
    }

    mappings.push(deliveryDetails.country);

    return mapToHtml(mappings);
};

export const mapDeliveryMethod = (itemOptions: Record<string, any>): string | null => {
    if (itemOptions?.deliveryTimescale === "standard") {
        return "Standard delivery (aim to dispatch within " + dispatchDays + " working days)";
    }
    if (itemOptions?.deliveryTimescale === "same-day") {
        return "Same Day";
    }
    return null;
};

export const mapToHtml = (mappings: string[]): string => {
    let htmlString: string = "";

    mappings.forEach((element) => {
        htmlString += element + "<br>";
    });
    return htmlString;
};
