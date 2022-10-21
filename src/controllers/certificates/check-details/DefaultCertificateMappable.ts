import { Basket, DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";

export interface DefaultCertificateMappable {
    isOptionSelected (itemOption: Boolean | undefined): string
    mapCertificateType (certificateType: string): string
    prependCurrencySymbol (fee: string): string
    mapAddressOption (addressOption: string | undefined): string
    mapDeliveryDetails (deliveryDetails: DeliveryDetails | undefined): string
    mapDeliveryMethod (itemOptions: Record<string, any>, multiBasketEnabled:Boolean): string | null
    mapEmailCopyRequired (itemOptions: Record<string, any>): string
}
