import chai from "chai";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink, getSelectionFromCertificate, getSelectionFromSession, getSelection } from "../../../src/controllers/certificates/additional.copies.controller";
import { dataEmpty, additionalCopiesTrue, additionalCopiesFalse, additionalCopiesNull } from "../../__mocks__/session.mocks";
import { Request } from "express";

const certificateItemWithQuantityOne = {
    quantity: 1 
} as CertificateItem;
const certificateItemWithQuantityFive = {
    quantity: 5
} as CertificateItem;
const certificateItemWithQuantityZero = {
    quantity: 0 
} as CertificateItem;
const certificateItemNoQuantity = {
} as CertificateItem;

const reqWithTrue = {
    session: additionalCopiesTrue 
} as Request;
const reqWithFalse = {
    session: additionalCopiesFalse
} as Request;
const reqWithNull = {
    session: additionalCopiesNull
} as Request;

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
    describe("assert getSelection returns the correct value", () => {
        it("if additionalCopies is true return 1", () => {
            chai.expect(getSelection(reqWithTrue)).to.equal(1);
        });
        it("if additionalCopies is false return 2", () => {
            chai.expect(getSelection(reqWithFalse)).to.equal(2);
        });
        it("if additionalCopies is null return 0", () => {
            chai.expect(getSelection(reqWithNull)).to.equal(0);
        });
    })
});