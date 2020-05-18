import { mapIncludedOnCertificate , mapDeliveryDetails ,
     mapDeliveryMethod, mapToHtml, mapCertificateType, applyCurrencySymbol}
     from "../../controllers/check.details.controller";
import { ItemOptions , RegisteredOfficeAddressDetails , DirectorOrSecretaryDetails }
    from "ch-sdk-node/dist/services/order/item/certificate/types";
import { DeliveryDetails } from "ch-sdk-node/dist/services/order/basket/types";

const directorDetails: DirectorOrSecretaryDetails = {
    includeAddress: true,
    includeAppointmentDate: true,
    includeBasicInformation: true,
    includeCountryOfResidence: true,
    includeDobType: "DobType",
    includeNationality: true,
    includeOccupation: true,
};

const secretaryDetails: DirectorOrSecretaryDetails = {
    includeAddress: true,
    includeAppointmentDate: true,
    includeBasicInformation: true,
    includeCountryOfResidence: true,
    includeDobType: "DobType",
    includeNationality: true,
    includeOccupation: true,
};

const registeredOfficeAddressDetails: RegisteredOfficeAddressDetails = {
    includeAddressRecordsType: "includeAddressRecordsType",
    includeDates: true,
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
    surname: "surname",
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
    surname: "Smith",
};

describe("mapIncludedOnCertificate", () => {

    it("should map the correct values when all options are true", () => {
        const returnedString: string = mapIncludedOnCertificate(itemOptions);
        const expectedString: string = "Statement of good standing<br>" +
            "Registered office address<br>Directors<br>Secretaries<br>Company objects<br>";

        expect(returnedString).toEqual(expectedString);
    });

    it("should map the no values when all options are false", () => {

        itemOptions.includeGoodStandingInformation = false;
        itemOptions.registeredOfficeAddressDetails.includeAddressRecordsType = "";
        itemOptions.directorDetails.includeBasicInformation = false;
        itemOptions.secretaryDetails.includeBasicInformation = false;
        itemOptions.includeCompanyObjectsInformation = false;

        const returnedString: string = mapIncludedOnCertificate(itemOptions);
        const expectedString: string = "";

        expect(returnedString).toEqual(expectedString);
    });

    it("should map the the values that are present", () => {
        itemOptions.includeGoodStandingInformation = true;
        itemOptions.directorDetails.includeBasicInformation = true;
        itemOptions.includeCompanyObjectsInformation = true;

        const returnedString: string = mapIncludedOnCertificate(itemOptions);
        const expectedString: string = "Statement of good standing<br>Directors<br>Company objects<br>";

        expect(returnedString).toEqual(expectedString);
    });
});

describe("mapDeliveryDetails", () => {

    it("should map the correct values when all options are present", () => {

        const returnedString: string = mapDeliveryDetails(deliveryDetails);
        const expectedString: string = "John Smith<br>" +
        "Address Line 1<br>Address Line 2<br>Locality<br>Region<br>CF10 2AA<br>Wales<br>";

        expect(returnedString).toEqual(expectedString);
    });

    it("should return a blank string if the delivery details are undefined", () => {

        const returnedString: string = mapDeliveryDetails(undefined);
        const expectedString: string = "";

        expect(returnedString).toEqual(expectedString);
    });
});

describe("mapDeliveryMethod", () => {

    it("should map the standard delivery string when 'standard' is returned from API", () => {

        const returnedString: string | null = mapDeliveryMethod(itemOptions);
        const expectedString: string = "Standard delivery (dispatched within 4 working days)";

        expect(returnedString).toEqual(expectedString);
    });

    it("should map the same day delivery string when 'same-day' is returned from API", () => {

        itemOptions.deliveryTimescale = "same-day";

        const returnedString: string | null = mapDeliveryMethod(itemOptions);
        const expectedString: string = "Same Day";

        expect(returnedString).toEqual(expectedString);
    });

    it("should return null if deliveryTimscale is null", () => {

        itemOptions.deliveryTimescale = "same-day";

        const returnedValue: string | null = mapDeliveryMethod(itemOptions);

        expect(returnedValue).toBeNull;
    });
});

describe("mapToHtml", () => {

    it("constructs a html string that spaces each value with a <br> tag", () => {

        let mappings = new Array<string>();
        mappings.push("Mapping 1");
        mappings.push("Mapping 2");
        mappings.push("Mapping 3");

        const mappedHtmlString: string = mapToHtml(mappings);
        const expectedString: string = "Mapping 1<br>Mapping 2<br>Mapping 3<br>";

        expect(mappedHtmlString).toEqual(expectedString);
    });
});

describe("mapCertificateType", () => {

    it("removes the '-' if present and capitalises the first letter", () => {

        const testString1: string = "incorporation";
        const testString2: string = "incorporation-with-all-name-changes";

        const mappedTestString1: string = mapCertificateType(testString1);
        const mappedTestString2: string = mapCertificateType(testString2);

        expect(mappedTestString1).toEqual("Incorporation");
        expect(mappedTestString2).toEqual("Incorporation with all company name changes");
    });
});

describe("applyCurrencySymbol", () => {

    it("it applies a '£' to the value passed in", () => {
        expect(applyCurrencySymbol("15")).toEqual("£15");
    });
});
