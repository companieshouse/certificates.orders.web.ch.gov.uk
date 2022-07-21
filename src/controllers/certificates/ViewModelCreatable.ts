import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";

export interface ViewModelCreatable {
    createViewModel (certificateItem: CertificateItem, basket: Basket): { [key: string]: any };
    getTemplate (): string;
}
