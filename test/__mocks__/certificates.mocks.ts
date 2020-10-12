import Resource from "ch-sdk-node/dist/services/resource";
import { CompanyProfile } from "ch-sdk-node/dist/services/company-profile";
import { CertificateItem } from "ch-sdk-node/dist/services/order/certificates/types";

export const mockCompanyProfileConfiguration: any = {
    companyNumber: "00000000"
};

export const mockBasketDetails: any = {
    deliveryDetails: {
        addressLine1: "117 kings road",
        addressLine2: "pontcanna",
        country: "wales",
        locality: "canton",
        postalCode: "cf5 4xb",
        region: "glamorgan"
    }
};

export const mockCertificateItem = {
    companyName: "test company",
    companyNumber: "00000000",
    itemCosts: [
        {
            itemCost: "15"
        }
    ],
    itemOptions: {
        certificateType: "dissolution"
    }
} as CertificateItem;

export const mockAcceptableDissolvedCompanyProfile: Resource<CompanyProfile> = {
    httpStatusCode: 200,
    resource: {
        companyName: "company name",
        companyNumber: "00000000",
        companyStatus: "dissolved",
        companyStatusDetail: "company status detail",
        dateOfCreation: "date of creation",
        jurisdiction: "jurisdiction",
        sicCodes: ["85100", "85200"],
        hasBeenLiquidated: false,
        type: "ltd",
        hasCharges: false,
        hasInsolvencyHistory: false,
        registeredOfficeAddress: {
            addressLineOne: "line1",
            addressLineTwo: "line2",
            careOf: "careOf",
            country: "uk",
            locality: "locality",
            poBox: "123",
            postalCode: "post code",
            premises: "premises",
            region: "region"
        },
        accounts: {
            nextAccounts: {
                periodEndOn: "2019-10-10",
                periodStartOn: "2019-01-01"
            },
            nextDue: "2020-05-31",
            overdue: false
        },
        confirmationStatement: {
            nextDue: "2020-05-31",
            overdue: false
        },
        links: {
            filingHistory: "/company/00000000/filing-history"
        }
    }
};

export const mockAcceptableNonDissolvedCompanyProfile: Resource<CompanyProfile> = {
    httpStatusCode: 200,
    resource: {
        companyName: "company name",
        companyNumber: "00000000",
        companyStatus: "active",
        companyStatusDetail: "company status detail",
        dateOfCreation: "date of creation",
        jurisdiction: "jurisdiction",
        sicCodes: ["85100", "85200"],
        hasBeenLiquidated: false,
        type: "ltd",
        hasCharges: false,
        hasInsolvencyHistory: false,
        registeredOfficeAddress: {
            addressLineOne: "line1",
            addressLineTwo: "line2",
            careOf: "careOf",
            country: "uk",
            locality: "locality",
            poBox: "123",
            postalCode: "post code",
            premises: "premises",
            region: "region"
        },
        accounts: {
            nextAccounts: {
                periodEndOn: "2019-10-10",
                periodStartOn: "2019-01-01"
            },
            nextDue: "2020-05-31",
            overdue: false
        },
        confirmationStatement: {
            nextDue: "2020-05-31",
            overdue: false
        },
        links: {
            filingHistory: "/company/00000000/filing-history"
        }
    }
};

export const mockNotAcceptableDissolvedCompanyLimitedPartnershipProfile: Resource<CompanyProfile> = {
    httpStatusCode: 200,
    resource: {
        companyName: "company name",
        companyNumber: "00000000",
        companyStatus: "dissolved",
        companyStatusDetail: "company status detail",
        dateOfCreation: "date of creation",
        jurisdiction: "jurisdiction",
        sicCodes: ["85100", "85200"],
        hasBeenLiquidated: false,
        type: "limited-partnership",
        hasCharges: false,
        hasInsolvencyHistory: false,
        registeredOfficeAddress: {
            addressLineOne: "line1",
            addressLineTwo: "line2",
            careOf: "careOf",
            country: "uk",
            locality: "locality",
            poBox: "123",
            postalCode: "post code",
            premises: "premises",
            region: "region"
        },
        accounts: {
            nextAccounts: {
                periodEndOn: "2019-10-10",
                periodStartOn: "2019-01-01"
            },
            nextDue: "2020-05-31",
            overdue: false
        },
        confirmationStatement: {
            nextDue: "2020-05-31",
            overdue: false
        },
        links: {
            filingHistory: "/company/00000000/filing-history"
        }
    }
};
