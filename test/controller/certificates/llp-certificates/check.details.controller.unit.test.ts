import chai from "chai";

import {
    mapCertificateType,
    applyCurrencySymbol,
    isOptionSelected,
    mapRegisteredOfficeAddress,
    mapDesignatedMembersOptions,
    mapMembersOptions
} from "../../../../src/controllers/certificates/llp-certificates/check.details.controller";
import {DobType} from "../../../../src/model/DobType";
import {AddressRecordsType} from "../../../../src/model/AddressRecordsType";

describe("certificate.check.details.controller.unit", () => {
    describe("mapCertificateType", () => {
        it("removes the '-' if present and capitalises the first letter", () => {
            const testString1: string = "incorporation";
            const testString2: string = "incorporation-with-all-name-changes";
            const testString3: string = "incorporation-with-last-name-change";
            const testString4: string = "dissolution-liquidation";

            const mappedTestString1: string = mapCertificateType(testString1);
            const mappedTestString2: string = mapCertificateType(testString2);
            const mappedTestString3: string = mapCertificateType(testString3);
            const mappedTestString4: string = mapCertificateType(testString4);

            chai.expect(mappedTestString1).to.equal("Incorporation");
            chai.expect(mappedTestString2).to.equal("Incorporation with all company name changes");
            chai.expect(mappedTestString3).to.equal("Incorporation with last name change");
            chai.expect(mappedTestString4).to.equal("Dissolution liquidation");
        });
    });

    describe("applyCurrencySymbol", () => {
        it("it applies a '£' to the value passed in", () => {
            chai.expect(applyCurrencySymbol("15")).to.equal("£15");
        });
    });

    describe("returnsYesOrNo", () => {
        it("it returns yes or no if value has been declared on certificate options", () => {
            chai.expect(isOptionSelected(true)).to.equal("Yes");
            chai.expect(isOptionSelected(undefined)).to.equal("No");
        });
    });

    describe("mapRegisteredOfficeAddress", () => {
        it("maps the include_address_records_type field to display on text on page", () => {
            chai.expect(mapRegisteredOfficeAddress(AddressRecordsType.CURRENT)).to.equal("Current address");
            chai.expect(mapRegisteredOfficeAddress(AddressRecordsType.CURRENT_AND_PREVIOUS)).to.equal("Current address and the one previous");
            chai.expect(mapRegisteredOfficeAddress(AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR)).to.equal("Current address and the two previous");
            chai.expect(mapRegisteredOfficeAddress(AddressRecordsType.ALL)).to.equal("All current and previous addresses");
            chai.expect(mapRegisteredOfficeAddress(undefined)).to.equal("No");
        });
    });

    describe("mapDesignatedMemberOptions", () => {
        it("maps all options selected correctly", () => {
            const designatedMemberOptions = {
                includeAddress: true,
                includeAppointmentDate: true,
                includeBasicInformation: true,
                includeCountryOfResidence: true,
                includeDobType: DobType.PARTIAL
            };

            chai.expect(mapDesignatedMembersOptions(designatedMemberOptions))
                .to.equal("Including designated members&#39;:<br><br>Correspondence address<br>Appointment date<br>Country of residence<br>Date of birth (month and year)<br>");
        });

        it("maps correctly when only one additional option selected", () => {
            const designatedMemberOptions = {
                includeBasicInformation: true,
                includeCountryOfResidence: true
            };

            chai.expect(mapDesignatedMembersOptions(designatedMemberOptions))
                .to.equal("Including designated members&#39;:<br><br>Country of residence<br>");
        });

        it("maps correctly when only basic information present", () => {
            const designatedMemberOptions = {
                includeAddress: false,
                includeAppointmentDate: false,
                includeBasicInformation: true,
                includeCountryOfResidence: false,
                includeDobType: undefined
            };

            chai.expect(mapDesignatedMembersOptions(designatedMemberOptions))
                .to.equal("Yes");
        });

        it("maps correctly when no basic information present", () => {
            const designatedMemberOptions = {};

            chai.expect(mapDesignatedMembersOptions(designatedMemberOptions))
                .to.equal("No");
        });
    });

    describe("mapMemberOptions", () => {
        it("maps all options selected correctly", () => {
            const memberOptions = {
                includeAddress: true,
                includeAppointmentDate: true,
                includeBasicInformation: true,
                includeCountryOfResidence: true,
                includeDobType: DobType.PARTIAL
            };

            chai.expect(mapMembersOptions(memberOptions))
                .to.equal("Including members&#39;:<br><br>Correspondence address<br>Appointment date<br>Country of residence<br>Date of birth (month and year)<br>");
        });

        it("maps correctly when only one additional option selected", () => {
            const memberOptions = {
                includeBasicInformation: true,
                includeCountryOfResidence: true
            };

            chai.expect(mapMembersOptions(memberOptions))
                .to.equal("Including members&#39;:<br><br>Country of residence<br>");
        });

        it("maps correctly when only basic information present", () => {
            const memberOptions = {
                includeAddress: false,
                includeAppointmentDate: false,
                includeBasicInformation: true,
                includeCountryOfResidence: false,
                includeDobType: undefined
            };

            chai.expect(mapMembersOptions(memberOptions))
                .to.equal("Yes");
        });

        it("maps correctly when no basic information present", () => {
            const memberOptions = {};

            chai.expect(mapMembersOptions(memberOptions))
                .to.equal("No");
        });
    });
});
