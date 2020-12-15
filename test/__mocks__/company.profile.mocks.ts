import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";

export const dummyCompanyProfileActiveCompany: CompanyProfile = {
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
};

export const dummyCompanyProfileDissolvedCompany: CompanyProfile = {
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
};

export const dummyCompanyProfileAcceptableCompanyType: Resource<CompanyProfile> = {
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

export const dummyCompanyProfileNotAcceptableCompanyType: Resource<CompanyProfile> = {
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
        type: "other",
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
