import {DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";

export interface DefaultCertificateMappable {
    isOptionSelected (itemOption: boolean | undefined): string
    mapCertificateType (certificateType: string): string
    prependCurrencySymbol (fee: string): string
    mapAddressOption (addressOption: string | undefined): string
    mapDeliveryDetails (deliveryDetails: DeliveryDetails | undefined): string
    mapDeliveryMethod (itemOptions: Record<string, any>, multiBasketEnabled:boolean): string | null
    mapEmailCopyRequired (itemOptions: Record<string, any>): string
}
