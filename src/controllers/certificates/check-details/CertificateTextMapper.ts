import {
    DirectorOrSecretaryDetails,
    MemberDetails
} from "@companieshouse/api-sdk-node/dist/services/order/certificates/types";
import { DeliveryDetails } from "@companieshouse/api-sdk-node/dist/services/order/basket/types";
import { AddressRecordsType } from "../../../model/AddressRecordsType";
import { DefaultCompanyMappable } from "./DefaultCompanyMappable";
import { LLPCompanyMappable } from "./LLPCompanyMappable";
const escape = require("escape-html");

export class CertificateTextMapper implements DefaultCompanyMappable, LLPCompanyMappable {
    private dispatchDays: string;

    public constructor (dispatchDays: string) {
        this.dispatchDays = dispatchDays;
    }

    public isOptionSelected (itemOption: Boolean | undefined): string {
        if (itemOption === undefined) {
            return "No";
        } else {
            return "Yes";
        }
    }

    public mapCertificateType (certificateType: string): string {
        if (certificateType === "incorporation-with-all-name-changes") {
            return "Incorporation with all company name changes";
        } else if (certificateType === "dissolution") {
            return "Dissolution with all company name changes";
        }

        const typeCapitalised = certificateType.charAt(0).toUpperCase() +
            certificateType.slice(1);

        return typeCapitalised.replace(/-/g, " ");
    }

    public prependCurrencySymbol (fee: string): string {
        return "£" + fee;
    }

    public mapAddressOption (addressOption: string | undefined): string {
        switch (addressOption) {
        case AddressRecordsType.CURRENT:
            return "Current address";
        case AddressRecordsType.CURRENT_AND_PREVIOUS:
            return "Current address and the one previous";
        case AddressRecordsType.CURRENT_PREVIOUS_AND_PRIOR:
            return "Current address and the two previous";
        case AddressRecordsType.ALL:
            return "All current and previous addresses";
        default:
            return "No";
        }
    }

    public mapDirectorOptions (directorOptions?: DirectorOrSecretaryDetails): string {
        if (directorOptions === undefined || directorOptions.includeBasicInformation === undefined) {
            return "No";
        }

        if (directorOptions.includeBasicInformation === true &&
            directorOptions.includeAddress === false &&
            directorOptions.includeAppointmentDate === false &&
            directorOptions.includeCountryOfResidence === false &&
            directorOptions.includeDobType === undefined &&
            directorOptions.includeNationality === false &&
            directorOptions.includeOccupation === false) {
            return "Yes";
        }

        const mappings: string[] = [];
        mappings.push("Including directors':");
        mappings.push("");

        if (directorOptions.includeAddress) {
            mappings.push("Correspondence address");
        }

        if (directorOptions.includeOccupation) {
            mappings.push("Occupation");
        }

        if (directorOptions.includeDobType === "partial" ||
            directorOptions.includeDobType === "full") {
            mappings.push("Date of birth (month and year)");
        }

        if (directorOptions.includeAppointmentDate) {
            mappings.push("Appointment date");
        }

        if (directorOptions.includeNationality) {
            mappings.push("Nationality");
        }

        if (directorOptions.includeCountryOfResidence) {
            mappings.push("Country of residence");
        }

        return this.mapToHtml(mappings);
    }

    public mapSecretaryOptions (secretaryOptions?: DirectorOrSecretaryDetails): string {
        if (secretaryOptions === undefined || secretaryOptions.includeBasicInformation === undefined) {
            return "No";
        }

        if (secretaryOptions.includeBasicInformation === true &&
            secretaryOptions.includeAddress === false &&
            secretaryOptions.includeAppointmentDate === false) {
            return "Yes";
        }

        const secretaryMappings: string[] = [];
        secretaryMappings.push("Including secretaries':");
        secretaryMappings.push("");

        if (secretaryOptions.includeAddress) {
            secretaryMappings.push("Correspondence address");
        }

        if (secretaryOptions.includeAppointmentDate) {
            secretaryMappings.push("Appointment date");
        }

        return this.mapToHtml(secretaryMappings);
    }

    public mapMembersOptions (heading: string, memberOptions?: MemberDetails): string {
        if (memberOptions === undefined || memberOptions.includeBasicInformation === undefined) {
            return "No";
        }

        if (memberOptions.includeBasicInformation === true &&
            memberOptions.includeAddress === false &&
            memberOptions.includeAppointmentDate === false &&
            memberOptions.includeCountryOfResidence === false &&
            memberOptions.includeDobType === undefined) {
            return "Yes";
        }

        const membersMappings: string[] = [];
        membersMappings.push(heading);
        membersMappings.push("");

        if (memberOptions.includeAddress) {
            membersMappings.push("Correspondence address");
        }

        if (memberOptions.includeAppointmentDate) {
            membersMappings.push("Appointment date");
        }

        if (memberOptions.includeCountryOfResidence) {
            membersMappings.push("Country of residence");
        }

        if (memberOptions.includeDobType === "partial" ||
            memberOptions.includeDobType === "full") {
            membersMappings.push("Date of birth (month and year)");
        }

        return this.mapToHtml(membersMappings);
    }

    public mapDeliveryDetails (deliveryDetails: DeliveryDetails | undefined): string {
        const mappings: string[] = [];

        if (deliveryDetails === undefined) {
            return "";
        }

        mappings.push(deliveryDetails.forename + " " + deliveryDetails.surname);

        if (deliveryDetails.companyName !== "" && deliveryDetails.companyName !== undefined) {
            mappings.push(deliveryDetails.companyName);
        }

        mappings.push(deliveryDetails.addressLine1);

        if (deliveryDetails.addressLine2 !== "" && deliveryDetails.addressLine2 !== undefined) {
            mappings.push(deliveryDetails.addressLine2);
        }

        mappings.push(deliveryDetails.locality);

        if (deliveryDetails.region !== "" && deliveryDetails.region !== undefined) {
            mappings.push(deliveryDetails.region);
        }

        if (deliveryDetails.postalCode !== "" && deliveryDetails.postalCode !== undefined) {
            mappings.push(deliveryDetails.postalCode);
        }

        mappings.push(deliveryDetails.country);

        return this.mapToHtml(mappings);
    }

    public mapDeliveryMethod (itemOptions: Record<string, any>): string | null {
        if (itemOptions?.deliveryTimescale === "standard") {
            return "Standard delivery (aim to dispatch within " + this.dispatchDays + " working days)";
        }
        if (itemOptions?.deliveryTimescale === "same-day") {
            return "Express (Orders received before 11am will be dispatched the same day. Orders received after 11am will be dispatched the next working day)";
        }
        return null;
    }

    private mapToHtml (mappings: string[]): string {
        let htmlString: string = "";

        mappings.forEach((element) => {
            htmlString += escape(element) + "<br>";
        });
        return htmlString;
    }

    public mapEmailCopyRequired (itemOptions: Record<string, any>): string {
        if (itemOptions?.deliveryTimescale === "same-day") {
            if (itemOptions?.includeEmailCopy === true) {
                return "Yes";
            } else {
                return "No";
            }
        } else {
            return "Email only available for express delivery method";
        }
    };
};
