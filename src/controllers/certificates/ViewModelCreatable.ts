import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { ViewModelVisitor } from "./ViewModelVisitor";

export interface ViewModelCreatable {
    createViewModel (certificateItem: CertificateItem, basket: Basket): { templateName: string, [key: string]: any };
    newViewModelVisitor(): ViewModelVisitor;
}
