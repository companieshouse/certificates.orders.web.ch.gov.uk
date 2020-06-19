import chai from "chai";
import sessionHandler from "ch-node-session-handler";
import {
    ItemOptions, RegisteredOfficeAddressDetails, DirectorOrSecretaryDetails
} from "ch-sdk-node/dist/services/order/item/certificate/types";
import { DeliveryDetails } from "ch-sdk-node/dist/services/order/basket/types";

import {
    mapIncludedOnCertificate, mapDeliveryDetails, mapDeliveryMethod, mapToHtml,
    mapCertificateType, applyCurrencySymbol
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

const deliveryDetails: DeliveryDetails = {
    addressLine1: "Address Line 1",
    addressLine2: "Address Line 2",
    country: "Wales",
    forename: "John",
    locality: "Locality",
    poBox: "PO Box",
    postalCode: "CF10 2AA",
    region: "Region",
    surname: "Smith"
};

describe("check.details.controller.unit", () => {
    describe("mapIncludedOnCertificate", () => {
        it("should map the correct values when all options are true", () => {
            const returnedString: string = mapIncludedOnCertificate(itemOptions);
            const expectedString: string = "Statement of good standing<br>" +
                "Registered office address<br>Directors<br>Secretaries<br>Company objects<br>";

            chai.expect(returnedString).to.equal(expectedString);
        });

        it("should map the no values when all options are false", () => {
            itemOptions.includeGoodStandingInformation = false;
            delete itemOptions.registeredOfficeAddressDetails.includeAddressRecordsType;
            itemOptions.directorDetails.includeBasicInformation = false;
            itemOptions.secretaryDetails.includeBasicInformation = false;
            itemOptions.includeCompanyObjectsInformation = false;

            const returnedString: string = mapIncludedOnCertificate(itemOptions);
            const expectedString: string = "";

            chai.expect(returnedString).to.equal(expectedString);
        });

        it("should map the the values that are present", () => {
            itemOptions.includeGoodStandingInformation = true;
            itemOptions.directorDetails.includeBasicInformation = true;
            itemOptions.includeCompanyObjectsInformation = true;

            const returnedString: string = mapIncludedOnCertificate(itemOptions);
            const expectedString: string = "Statement of good standing<br>Directors<br>Company objects<br>";

            chai.expect(returnedString).to.equal(expectedString);
        });
    });

    describe("mapDeliveryDetails", () => {
        it("should map the correct values when all options are present", () => {
            const returnedString: string = mapDeliveryDetails(deliveryDetails);
            const expectedString: string = "John Smith<br>" +
                "Address Line 1<br>Address Line 2<br>Locality<br>Region<br>CF10 2AA<br>Wales<br>";

            chai.expect(returnedString).to.equal(expectedString);
        });

        it("should return a blank string if the delivery details are undefined", () => {
            const returnedString: string = mapDeliveryDetails(undefined);
            const expectedString: string = "";

            chai.expect(returnedString).to.equal(expectedString);
        });
    });

    describe("mapDeliveryMethod", () => {
        it("should map the standard delivery string when 'standard' is returned from API", () => {
            const returnedString: string | null = mapDeliveryMethod(itemOptions);
            const expectedString: string = "Standard delivery (aim to dispatch within 4 working days)";

            chai.expect(returnedString).to.equal(expectedString);
        });

        it("should map the same day delivery string when 'same-day' is returned from API", () => {
            itemOptions.deliveryTimescale = "same-day";

            const returnedString: string | null = mapDeliveryMethod(itemOptions);
            const expectedString: string = "Same Day";

            chai.expect(returnedString).to.equal(expectedString);
        });

        it("should return null if deliveryTimscale is null", () => {
            const emptyItemOptions = {} as ItemOptions;

            const returnedValue: string | null = mapDeliveryMethod(emptyItemOptions);

            chai.expect(returnedValue).to.be.null;
        });
    });

    describe("mapToHtml", () => {
        it("constructs a html string that spaces each value with a <br> tag", () => {
            const mappings:string[] = [];
            mappings.push("Mapping 1");
            mappings.push("Mapping 2");
            mappings.push("Mapping 3");

            const mappedHtmlString: string = mapToHtml(mappings);
            const expectedString: string = "Mapping 1<br>Mapping 2<br>Mapping 3<br>";

            chai.expect(mappedHtmlString).to.equal(expectedString);
        });
    });

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
});
