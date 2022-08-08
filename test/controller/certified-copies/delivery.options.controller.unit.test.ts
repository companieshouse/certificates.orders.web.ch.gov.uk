import chai from "chai";
import { CertifiedCopyItem } from "@companieshouse/api-sdk-node/dist/services/order/certified-copies/types";
import { dataEmpty } from "../../__mocks__/session.mocks";

describe("delivery.options.controller.unit", () => {
    describe("setBackUrl for no option selected", () => {
        it("the back button link should take the user to the certified documents page", () => {
            const certifiedCopyItem = {
                itemOptions: {
                    deliveryTimescale: "deliveryOption"
                }
            } as CertifiedCopyItem;
            chai.expect($(certifiedCopyItem)).to.include("certified-documents");
        });
    });
});