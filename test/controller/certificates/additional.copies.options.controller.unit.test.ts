import chai from "chai";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink, getSelectionFromCertificate, getSelectionFromSession } from "../../../src/controllers/certificates/additional.copies.controller";
import { dataEmpty, additionalCopiesTrue, additionalCopiesFalse, additionalCopiesNull } from "../../__mocks__/session.mocks";
import { Request } from "express";

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
        it("a quantity of 1 returns 1", () => {
            const certificateItem = {
                quantity: 1 
            } as CertificateItem;
            chai.expect(getSelectionFromCertificate(certificateItem)).to.equal(1);
        });
        it("a quantity of 5 returns 2", () => {
            const certificateItem = {
                quantity: 5 
            } as CertificateItem;
            chai.expect(getSelectionFromCertificate(certificateItem)).to.equal(2);
        });
        it("a quantity of 0 returns 0", () => {
            const certificateItem = {
                quantity: 0 
            } as CertificateItem;
            chai.expect(getSelectionFromCertificate(certificateItem)).to.equal(0);
        });
    });
    describe("assert getSelectionFromSession returns the correct value", () => {
        it("if additionalCopies is true return 1", () => {
            const req = {
                session: additionalCopiesTrue 
            } as Request;
            chai.expect(getSelectionFromSession(req)).to.equal(1);
        });
        it("if additionalCopies is false return 2", () => {
            const req = {
                session: additionalCopiesFalse 
            } as Request;
            chai.expect(getSelectionFromSession(req)).to.equal(2);
        });
        it("if additionalCopies is null return 0", () => {
            const req = {
                session: additionalCopiesNull 
            } as Request;
            chai.expect(getSelectionFromSession(req)).to.equal(0);
        });
    })
});