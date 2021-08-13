import chai from "chai";
import sessionHandler from "@companieshouse/node-session-handler";
import {
    ItemOptions, RegisteredOfficeAddressDetails, DirectorOrSecretaryDetails
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";

import {
    mapCertificateType, applyCurrencySymbol, isOptionSelected, mapRegisteredOfficeAddress, mapDirectorOptions, mapSecretaryOptions
} from "../../../src/controllers/certificates/check.details.controller";

const directorDetails: DirectorOrSecretaryDetails = {
    includeAddress: true,
    includeAppointmentDate: true,
    includeBasicInformation: true,
    includeCountryOfResidence: true,
    includeDobType: "DobType",
    includeNationality: true,
    includeOccupation: true
};

const secretaryDetails: DirectorOrSecretaryDetails = {
    includeAddress: true,
    includeAppointmentDate: true,
    includeBasicInformation: true,
    includeCountryOfResidence: true,
    includeDobType: "DobType",
    includeNationality: true,
    includeOccupation: true
};

const registeredOfficeAddressDetails: RegisteredOfficeAddressDetails = {
    includeAddressRecordsType: "includeAddressRecordsType",
    includeDates: true
};

const itemOptions: ItemOptions = {
    certificateType: "certificateType",
    collectionLocation: "collectionLocation",
    contactNumber: "contactNumber",
    deliveryMethod: "deliveryMethod",
    deliveryTimescale: "standard",
    directorDetails,
    forename: "forename",
    includeCompanyObjectsInformation: true,
    includeEmailCopy: true,
    includeGoodStandingInformation: true,
    registeredOfficeAddressDetails,
    secretaryDetails,
    surname: "surname"
};

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
            chai.expect(mapRegisteredOfficeAddress("current")).to.equal("Current address");
            chai.expect(mapRegisteredOfficeAddress("current-and-previous")).to.equal("Current address and the one previous");
            chai.expect(mapRegisteredOfficeAddress("current-previous-and-prior")).to.equal("Current address and the two previous");
            chai.expect(mapRegisteredOfficeAddress("all")).to.equal("All current and previous addresses");
            chai.expect(mapRegisteredOfficeAddress(undefined)).to.equal("No");
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
                includeNationality: true,
                includeOccupation: true
            };

            chai.expect(mapDirectorOptions(directorOptions))
                .to.equal("Including directors&#39;:<br>Correspondence address<br>Occupation<br>Date of birth (month and year)<br>Appointment date<br>Nationality<br>Country of residence<br>");
        });

        it("maps correctly when only one additional option selected", () => {
            const directorOptions = {
                includeBasicInformation: true,
                includeNationality: true
            };

            chai.expect(mapDirectorOptions(directorOptions))
                .to.equal("Including directors&#39;:<br>Nationality<br>");
        });

        it("maps correctly when only basic information present", () => {
            const directorOptions = {
                includeAddress: false,
                includeAppointmentDate: false,
                includeBasicInformation: true,
                includeCountryOfResidence: false,
                includeNationality: false,
                includeOccupation: false
            };

            chai.expect(mapDirectorOptions(directorOptions))
                .to.equal("Yes");
        });

        it("maps correctly when no directors options present", () => {
            const directorOptions = {};

            chai.expect(mapDirectorOptions(directorOptions))
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

            chai.expect(mapSecretaryOptions(secretaryOptions))
                .to.equal("Including secretaries&#39;:<br>Correspondence address<br>Appointment date<br>");
        });

        it("maps correctly when only one additional option selected", () => {
            const secretaryOptions = {
                includeBasicInformation: true,
                includeAppointmentDate: true
            };

            chai.expect(mapSecretaryOptions(secretaryOptions))
                .to.equal("Including secretaries&#39;:<br>Appointment date<br>");
        });

        it("maps correctly when only basic information present", () => {
            const secretaryOptions = {
                includeAddress: false,
                includeAppointmentDate: false,
                includeBasicInformation: true
            };

            chai.expect(mapSecretaryOptions(secretaryOptions))
                .to.equal("Yes");
        });

        it("maps correctly when no secretary options are present", () => {
            const secretaryOptions = {};

            chai.expect(mapSecretaryOptions(secretaryOptions))
                .to.equal("No");
        });
    });
});
