import chai from "chai";
import { CertificateItem } from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import {
    setBackLink,
    setDesignatedMemberOption
} from "../../../../src/controllers/certificates/llp-certificates/designated-members.options.controller";
import {dataEmpty, fullPageFalse, fullPageTrue} from "../../../__mocks__/session.mocks";
import {DesignatedMemberOptionName} from "../../../../src/controllers/certificates/llp-certificates/DesignatedMemberOptionName";


describe("designated-member.options.controller.unit", () => {
    describe("setBackUrl for no registered address option selected", () => {
        it("the back button link should take the user to the certificate options page", () => {
            const certificateItem = {
                itemOptions: {
                    forename: "john",
                    surname: "smith"
                }
            } as CertificateItem;

            chai.expect(setBackLink(certificateItem, dataEmpty)).to.equal("llp-certificate-options");
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

            chai.expect(setBackLink(certificateItem, fullPageFalse)).to.equal("registered-office-options"); // TODO refactor when LLP Address Options in place
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

            chai.expect(setBackLink(certificateItem, fullPageTrue)).to.equal("registered-office-options?layout=full"); // TODO refactor when LLP Address Options in place
        });
    });

    describe("Set includeAddress to true", () => {
        it("when address has been ticked it should return it as true", () => {
            const option: string [] = ["address"];
            const designatedMemberOption = setDesignatedMemberOption(option);

            chai.expect(designatedMemberOption.includeAddress).to.equal(true);
        });
    });

    describe("It should set correspondence address, date of birth type and appointment date to true when selected and everything else to false", () => {
        it("When correspondence address, date of birth type and appointment date have been selected, they should be set to true with everything else set to false", () => {
            const option: string [] = [DesignatedMemberOptionName.INCLUDE_ADDRESS, DesignatedMemberOptionName.INCLUDE_DOB_TYPE, DesignatedMemberOptionName.INCLUDE_APPOINTMENT_DATE];
            const returnedDesignatedMemberOption = setDesignatedMemberOption(option);

            chai.expect(returnedDesignatedMemberOption.includeAddress).to.equal(true);
            chai.expect(returnedDesignatedMemberOption.includeDobType).to.equal("partial");
            chai.expect(returnedDesignatedMemberOption.includeAppointmentDate).to.equal(true);
            chai.expect(returnedDesignatedMemberOption.includeCountryOfResidence).to.equal(false);
        });
    });
});
