import chai from "chai";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { setBackLink, setDirectorOption } from "../../../src/controllers/certificates/director.options.controller";
import { dataEmpty, fullPageFalse, fullPageTrue } from "../../__mocks__/session.mocks";

describe("director.options.controller.unit", () => {
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
        it("should link to the abbreviated registered office option page", () => {
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

    describe("setBackUrl for registered office option selected via full page", () => {
        it("should link to the full registered office option page", () => {
            const certificateItem = {
                itemOptions: {
                    registeredOfficeAddressDetails: {
                        includeAddressRecordsType: "current"
                    }
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, fullPageTrue)).to.equal("registered-office-options?layout=full");
        });
    });

    describe("Set includeAddress to true", () => {
        it("when address has been ticked it should return it as true", () => {
            const option: string [] = ["address"];
            const returnedDirectorOption = setDirectorOption(option);

            chai.expect(returnedDirectorOption.includeAddress).to.equal(true);
        });
    });

    describe("It should set address, occupation and DOB to true when selected and everything else to false", () => {
        it("When address, occupation and DOB have been selected, they should be set to true with everything else set to false", () => {
            const option: string [] = ["address", "occupation", "dob"];
            const returnedDirectorOption = setDirectorOption(option);

            chai.expect(returnedDirectorOption.includeAddress).to.equal(true);
            chai.expect(returnedDirectorOption.includeOccupation).to.equal(true);
            chai.expect(returnedDirectorOption.includeDobType).to.equal("partial");
            chai.expect(returnedDirectorOption.includeAppointmentDate).to.equal(false);
            chai.expect(returnedDirectorOption.includeNationality).to.equal(false);
            chai.expect(returnedDirectorOption.includeCountryOfResidence).to.equal(false);
        });
    });
});
