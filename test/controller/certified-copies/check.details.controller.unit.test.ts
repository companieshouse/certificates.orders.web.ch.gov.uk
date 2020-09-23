import { expect } from "chai";
import sinon from "sinon";

import {
    mapFilingHistoryDescription, removeAsterisks, mapDate, mapDateFullMonth,
    mapFilingHistoriesDocuments,
    addCurrencySymbol
} from "../../../src/controllers/certified-copies/check.details.controller";
import * as apiEnumerations from "../../../src/config/api.enumerations";
import { Filing } from "ch-sdk-node/dist/services/filing-history";

describe("certified-copies.check.details.controller.unit", () => {
    describe("mapFilingHistoryDescription", () => {
        it("should return the description in the descriptionValues if it is present", () => {
            const filing: Filing = {
                type: "363s",
                description: "legacy",
                category: "annual-return",
                descriptionValues: {
                    description: "Return made up to 28/12/92; no change of members"
                },
                date: "1993-01-08"
            };
            const result = mapFilingHistoryDescription(filing);
            expect(result).to.equal(filing?.descriptionValues?.description);
        });

        it("should replace the values in the description with the values in the descriptionValues", () => {
            const filing: Filing = {
                actionDate: "2010-02-12",
                description: "change-person-director-company-with-change-date",
                type: "CH01",
                descriptionValues: {
                    change_date: "2010-02-12",
                    officer_name: "Thomas David Wheare"
                },
                category: "officers",
                date: "2010-02-12"
            };
            const result = mapFilingHistoryDescription(filing);
            expect(result).to.equal("Director's details changed for Thomas David Wheare on 12 February 2010");
        });

        it("should add the figure and currency if present in capital", () => {
            const filing: Filing = {
                descriptionValues: {
                    date: "2011-06-30",
                    capital: [
                        {
                            figure: "113,691,167",
                            currency: "GBP"
                        }
                    ]
                },
                type: "SH01",
                category: "capital",
                actionDate: "2011-06-30",
                date: "2011-07-07",
                description: "capital-allotment-shares"
            };
            const result = mapFilingHistoryDescription(filing);
            expect(result).to.equal("Statement of capital following an allotment of shares on 30 June 2011, GBP 113,691,167");
        });

        it("should add the figure, currency and date if present in capital and is not a capital cancellation", () => {
            const filing: Filing = {
                description: "capital-return-purchase-own-shares-treasury-capital-date",
                descriptionValues: {
                    date: "2011-07-26",
                    capital: [
                        {
                            currency: "GBP",
                            figure: "121,728,680.5",
                            date: "2011-07-26"
                        }
                    ]
                },
                type: "SH03",
                category: "capital",
                actionDate: "2011-07-26",
                date: "2011-08-10"
            };
            const result = mapFilingHistoryDescription(filing);
            expect(result).to.equal("Purchase of own shares. Shares purchased into treasury:, GBP 121,728,680.5 on 2011-07-26");
        });
    });

    describe("removeAsterisks", () => {
        it("should remove asterisks in text", () => {
            const text = "**Appointment** of ";
            const result = removeAsterisks(text);
            expect(result).to.equal("Appointment of ");
        });
    });

    describe("addCurrencySymbol", () => {
        it("should add currency symbol to cost", () => {
            const cost = "15";
            const result = addCurrencySymbol(cost);
            expect(result).to.equal("£15");
        });
    });

    describe("mapDate", () => {
        it("should map date from 2010-02-12 to 12 Feb 2010", () => {
            const date = "2010-02-12";
            const result = mapDate(date);
            expect(result).to.equal("12 Feb 2010");
        });
    });

    describe("mapDateFullMonth", () => {
        it("should map date from 2010-02-12 to 12 February 2010", () => {
            const date = "2010-02-12";
            const result = mapDateFullMonth(date);
            expect(result).to.equal("12 February 2010");
        });
    });

    // describe("mapFilingHistoriesDocuments", () => {
    //     it("should map filing history array correctly", () => {
    //         const filingHistoryDocuments = [{
    //             filingHistoryDate: "2010-02-12",
    //             filingHistoryDescription: "change-person-director-company-with-change-date",
    //             filingHistoryDescriptionValues: {
    //                 change_date: "2010-02-12",
    //                 officer_name: "Thomas David Wheare"
    //             },
    //             filingHistoryId: "MzAwOTM2MDg5OWFkaXF6a2N4",
    //             filingHistoryType: "CH01",
    //             filingHistoryCost: "15"
    //         }];
    //         sinon.stub(apiEnumerations, "getFullFilingHistoryDescription")
    //             .returns("Appointment of {officer_name} as a director on {change_date}");
    //         const result = mapFilingHistoriesDocuments(filingHistoryDocuments);

    //         expect(result[0].filingHistoryDescription).to.equal("Appointment of Thomas David Wheare as a director on 12 February 2010");
    //         expect(result[0].filingHistoryDate).to.equal("12 Feb 2010");
    //         expect(result[0].filingHistoryId).to.equal("MzAwOTM2MDg5OWFkaXF6a2N4");
    //         expect(result[0].filingHistoryType).to.equal("CH01");
    //         expect(result[0].filingHistoryCost).to.equal("£15");
    //     });
    // });
});
