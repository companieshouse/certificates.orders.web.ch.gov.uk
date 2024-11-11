import chai from "chai";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink, getSelectionFromCertificate, } from "../../../src/controllers/certificates/additional.copies.controller";
import { dataEmpty} from "../../__mocks__/session.mocks";

const certificateItemWithQuantityOne = {
    quantity: 1 
} as CertificateItem;
const certificateItemWithQuantityFive = {
    quantity: 5
} as CertificateItem;
const certificateItemWithQuantityZero = {
    quantity: 0 
} as CertificateItem;

describe("additional.copies.options.controller.unit", () => {
    describe("setBackUrl for no option selected", () => {
        it("the back button link should take the user to the email options page", () => {
            const certificateItem = {
                itemOptions: {
                    deliveryTimescale: "deliveryOption"
                }
            } as CertificateItem;
            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("delivery-options");
        });
    });
    describe("assert getSelectionFromCertificate returns the correct value", () => {
        it("if quantity is 1 return 2", () => {
            chai.expect(getSelectionFromCertificate(certificateItemWithQuantityOne)).to.equal(2);
        });
        it("if quantity is 5 return 1", () => {
            chai.expect(getSelectionFromCertificate(certificateItemWithQuantityFive)).to.equal(1);
        });
        it("if quantity is 0 return 0", () => {
            chai.expect(getSelectionFromCertificate(certificateItemWithQuantityZero)).to.equal(0);
        });
    })
});