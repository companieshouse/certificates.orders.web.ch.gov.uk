import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket";
import { Item } from "@companieshouse/api-sdk-node/dist/services/order/order";
import { Response } from "express";

export class StaticRedirectCallback {
    private readonly deliverableItemPredicate: (item: Item) => boolean;

    constructor (deliverableItemFilter: (item: Item) => boolean) {
        this.deliverableItemPredicate = deliverableItemFilter;
    }

    redirectEnrolled (request: EnrolledRedirectRequest) {
        if (((request.items || [])).find(this.deliverableItemPredicate)) {
            if (request.deliveryDetails) {
                return request.response.redirect("/basket");
            }
            return request.response.redirect("/delivery-details");
        } else {
            return request.response.redirect("/delivery-details");
        }
    }
}

export const BY_ITEM_KIND = item => item.kind === "item#certificate" || item.kind === "item#certified-copy";
export class EnrolledRedirectRequest {
    items?: Item[];
    deliveryDetails?: DeliveryDetails;
    response: Response;
}
