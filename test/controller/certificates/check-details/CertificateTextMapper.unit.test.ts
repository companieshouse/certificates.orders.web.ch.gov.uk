import chai from "chai";

import { DobType } from "../../../../src/model/DobType";
import { AddressRecordsType } from "../../../../src/model/AddressRecordsType";
import { CertificateTextMapper } from "../../../../src/controllers/certificates/check-details/CertificateTextMapper";
import { DISPATCH_DAYS } from "../../../../src/config/config";
import sessionHandler from "@companieshouse/node-session-handler"; // needed for side-effects

describe("CertificateTextMapper", () => {
    const textMapper = new CertificateTextMapper("10");
    const dispatchDays: string = DISPATCH_DAYS;

    describe("mapCertificateType", () => {
        it("removes the '-' if present and capitalises the first letter", () => {
            const testString1: string = "incorporation";
            const testString2: string = "incorporation-with-all-name-changes";
            const testString3: string = "incorporation-with-last-name-change";
            const testString4: string = "dissolution-liquidation";

            const mappedTestString1: string = textMapper.mapCertificateType(testString1);
            const mappedTestString2: string = textMapper.mapCertificateType(testString2);
            const mappedTestString3: string = textMapper.mapCertificateType(testString3);
            const mappedTestString4: string = textMapper.mapCertificateType(testString4);

            chai.expect(mappedTestString1).to.equal("Incorporation");
            chai.expect(mappedTestString2).to.equal("Incorporation with all company name changes");
            chai.expect(mappedTestString3).to.equal("Incorporation with last name change");
            chai.expect(mappedTestString4).to.equal("Dissolution liquidation");
        });
    });

    describe("prependCurrencySymbol", () => {
        it("it applies a '£' to the value passed in", () => {
            chai.expect(textMapper.prependCurrencySymbol("15")).to.equal("£15");
        });
    });

    describe("returnsYesOrNo", () => {
        it("it returns yes or no if value has been declared on certificate options", () => {
            chai.expect(textMapper.isOptionSelected(true)).to.equal("Yes");
            chai.expect(textMapper.isOptionSelected(undefined)).to.equal("No");
        });
    });

    describe("mapRegisteredOfficeAddress", () => {
        it("maps the include_address_records_type field to display on text on page", () => {
            chai.expect(textMapper.mapAddressOption(AddressRecordsType.CURRENT)).to.equal("Current address");
            chai.expect(textMapper.mapAddressOption(AddressRecordsType.CURRENT_AND_PREVIOUS)).to.equal("Current address and the one previous");
            chai.expect(textMapper.mapAddressOption(AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR)).to.equal("Current address and the two previous");
            chai.expect(textMapper.mapAddressOption(AddressRecordsType.ALL)).to.equal("All current and previous addresses");
            chai.expect(textMapper.mapAddressOption(undefined)).to.equal("No");
        });
    });

    describe("mapDirectorOptions", () => {
        it("maps all options selected correctly", () => {
            const directorOptions = {
                includeAddress: true,
                includeAppointmentDate: true,
                includeBasicInformation: true,
                includeCountryOfResidence: true,
                includeDobType: "partial",
                includeNationality: true
            };

            chai.expect(textMapper.mapDirectorOptions(directorOptions))
                .to.equal("Including directors&#39;:<br><br>Correspondence address<br>Date of birth (month and year)<br>Appointment date<br>Nationality<br>Country of residence<br>");
        });

        it("maps correctly when only one additional option selected", () => {
            const directorOptions = {
                includeBasicInformation: true,
                includeNationality: true
            };

            chai.expect(textMapper.mapDirectorOptions(directorOptions))
                .to.equal("Including directors&#39;:<br><br>Nationality<br>");
        });

        it("maps correctly when only basic information present", () => {
            const directorOptions = {
                includeAddress: false,
                includeAppointmentDate: false,
                includeBasicInformation: true,
                includeCountryOfResidence: false,
                includeNationality: false
            };

            chai.expect(textMapper.mapDirectorOptions(directorOptions))
                .to.equal("Yes");
        });

        it("maps correctly when no directors options present", () => {
            const directorOptions = {};

            chai.expect(textMapper.mapDirectorOptions(directorOptions))
                .to.equal("No");
        });
    });

    describe("mapSecretaryOptions", () => {
        it("maps all options selected correctly", () => {
            const secretaryOptions = {
                includeAddress: true,
                includeAppointmentDate: true,
                includeBasicInformation: true
            };

            chai.expect(textMapper.mapSecretaryOptions(secretaryOptions))
                .to.equal("Including secretaries&#39;:<br><br>Correspondence address<br>Appointment date<br>");
        });

        it("maps correctly when only one additional option selected", () => {
            const secretaryOptions = {
                includeBasicInformation: true,
                includeAppointmentDate: true
            };

            chai.expect(textMapper.mapSecretaryOptions(secretaryOptions))
                .to.equal("Including secretaries&#39;:<br><br>Appointment date<br>");
        });

        it("maps correctly when only basic information present", () => {
            const secretaryOptions = {
                includeAddress: false,
                includeAppointmentDate: false,
                includeBasicInformation: true
            };

            chai.expect(textMapper.mapSecretaryOptions(secretaryOptions))
                .to.equal("Yes");
        });

        it("maps correctly when no secretary options are present", () => {
            const secretaryOptions = {};

            chai.expect(textMapper.mapSecretaryOptions(secretaryOptions))
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

            chai.expect(textMapper.mapMembersOptions("Header:", memberOptions))
                .to.equal("Header:<br><br>Correspondence address<br>Appointment date<br>Country of residence<br>Date of birth (month and year)<br>");
        });

        it("maps correctly when only one additional option selected", () => {
            const memberOptions = {
                includeBasicInformation: true,
                includeCountryOfResidence: true
            };

            chai.expect(textMapper.mapMembersOptions("Header:", memberOptions))
                .to.equal("Header:<br><br>Country of residence<br>");
        });

        it("maps correctly when only basic information present", () => {
            const memberOptions = {
                includeAddress: false,
                includeAppointmentDate: false,
                includeBasicInformation: true,
                includeCountryOfResidence: false,
                includeDobType: undefined
            };

            chai.expect(textMapper.mapMembersOptions("Header:", memberOptions))
                .to.equal("Yes");
        });

        it("maps correctly when no basic information present", () => {
            const memberOptions = {};

            chai.expect(textMapper.mapMembersOptions("Header:", memberOptions))
                .to.equal("No");
        });
    });

    describe("maps email required return correctly", () => {
        it("it returns output stating email copy is only available for express delivery option when standard delivery is selected", () => {
            const itemOptions = {
                deliveryTimescale: "standard",
                emailCopyRequired: false
            };
            chai.expect(textMapper.mapEmailCopyRequired(itemOptions)).to.equal("Email only available for express dispatch");
        });

        it("it returns Yes for express delivery option with email required selected true", () => {
            const itemOptions = {
                deliveryTimescale: "same-day",
                includeEmailCopy: true
            };

            chai.expect(textMapper.mapEmailCopyRequired(itemOptions)).to.equal("Yes");
        });

        it("it returns No for express delivery option with email required selected false", () => {
            const itemOptions = {
                deliveryTimescale: "same-day",
                includeEmailCopy: false
            };
            chai.expect(textMapper.mapEmailCopyRequired(itemOptions)).to.equal("No");
        });
    });

    describe("maps dispatch method correctly", () => {
        it("it returns output stating standard delivery is selected if multiBasketEnabled", () => {
            const itemOptions = {
                deliveryTimescale: "standard",
                multiBasketEnabled: true
            };
            chai.expect(textMapper.mapDeliveryMethod(itemOptions, true)).to.equal("Standard");
        });

        it("it returns Express for express delivery option selected if multiBasketEnabled ", () => {
            const itemOptions = {
                deliveryTimescale: "same-day",
                multiBasketEnabled: true
            };
            chai.expect(textMapper.mapDeliveryMethod(itemOptions, true)).to.equal("Express");
        });

        it("it returns output stating standard delivery is selected", () => {
            const itemOptions = {
                deliveryTimescale: "standard"
            };
            chai.expect(textMapper.mapDeliveryMethod(itemOptions, false)).to.equal("Standard (aim to send out within " + dispatchDays + " working days)");
        });

        it("it returns Express for express delivery option selected", () => {
            const itemOptions = {
                deliveryTimescale: "same-day"
            };
            chai.expect(textMapper.mapDeliveryMethod(itemOptions, false)).to.equal("Express (Orders received before 11am will be sent out the same day. Orders received after 11am will be sent out the next working day)");
        });

        it("It returns null if deliveryTimscale is null", () => {
            const itemOptions = {
                deliveryTimescale: "null"
            };
            chai.expect(textMapper.mapDeliveryMethod(itemOptions, false)).to.equal(null);
        });
    });
});
