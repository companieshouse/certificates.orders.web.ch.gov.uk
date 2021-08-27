import chai from "chai";
import sessionHandler from "@companieshouse/node-session-handler";
import {
    ItemOptions, RegisteredOfficeAddressDetails, DirectorOrSecretaryDetails
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";

import {
    mapDeliveryDetails, mapDeliveryMethod, mapToHtml
} from "../../src/utils/check.details.utils";
import { DISPATCH_DAYS } from "../../src/config/config";

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
    companyType: "limited-by-shares",
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

describe("certificate.check.details.controller.unit", () => {
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
            const expectedString: string = "Standard delivery (aim to dispatch within " + DISPATCH_DAYS + " working days)";

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
});
