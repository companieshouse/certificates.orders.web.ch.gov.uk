import { ViewModelVisitor } from "./ViewModelVisitor";
import { Basket } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";

export class VisitableViewModel {
    constructor (public viewModel: { [key: string]: any }, public basket: Basket) {
    }

    accept (visitor: ViewModelVisitor) {
        visitor.visit(this);
    }
}
