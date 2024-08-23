import chai from "chai";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink } from "../../../src/controllers/certificates/additional.copies.quantity.controller";
import { dataEmpty } from "../../__mocks__/session.mocks";

describe("additional.copies.quantity.controller.unit", () => {
    describe("setBackUrl for no option selected", () => {
        it("the back button link should take the user to the additional copies options page", () => {
            const certificateItem = {
                itemOptions: {
                    deliveryTimescale: "deliveryOption"
                }
            } as CertificateItem;
            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("additional-copies");
        });
    });
});