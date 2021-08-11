import chai from "chai";
import { CertificateItem } from "ch-sdk-node/dist/services/order/certificates/types";
import { setBackLink, setSecretaryOption } from "../../../src/controllers/certificates/secretary.options.controller";
import { dataEmpty, fullPageFalse } from "../../__mocks__/session.mocks";

describe("setSecretaryOption function test", () => {
    it("when address has been ticked it should return it as true", () => {
        const option: string [] = ["address"];
        const returnedSecretaryOption = setSecretaryOption(option);

        chai.expect(returnedSecretaryOption.includeAddress).to.equal(true);
    });

    it("When address and appointment option are selected", () => {
        const option: string [] = ["address", "appointment"];
        const returnedSecretaryOption = setSecretaryOption(option);

        chai.expect(returnedSecretaryOption.includeAddress).to.equal(true);
        chai.expect(returnedSecretaryOption.includeAppointmentDate).to.equal(true);
        chai.expect(returnedSecretaryOption.includeBasicInformation).to.equal(true);
    });
});

describe("secretary.options.controller.unit", () => {
    describe("setBackUrl for no registered address option selected", () => {
        it("the back button link should take the user to the certificate options page", () => {
            const certificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith"
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("certificate-options");
        });
    });

    describe("setBackUrl for registered office option selected", () => {
        it("the back button link should take the user to the registered office option page", () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, fullPageFalse)).to.equal("registered-office-options");
        });
    });

    describe("setBackUrl for director option selected", () => {
        it("the back button link should take the user to the director options page", () => {
            const certificateItem = {
                itemOptions: {
                    directorDetails: {
                        includeBasicInformation: true
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("director-options");
        });
    });
});
