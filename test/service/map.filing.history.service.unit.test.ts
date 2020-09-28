import { expect } from "chai";

import { mapFilingHistoryDescription, removeAsterisks, mapDateFullMonth } from "../../src/service/map.filing.history.service";
import { Filing } from "ch-sdk-node/dist/services/filing-history";

describe("map.filing.history.service.unit", () => {
    describe("mapFilingHistoryDescription", () => {
        it("should return description in the descriptionValues if it is present", () => {
            const filing: Filing = {
                description: "legacy",
                descriptionValues: {
                    description: "Return made up to 28/12/92; no change of members"
                }
            };
            const result = mapFilingHistoryDescription(filing);
            expect(result).to.equal("Return made up to 28/12/92; no change of members");
        });

        it("should replace the values in the description with the values in the descriptionValues", () => {
            const filing: Filing = {
                description: "change-person-director-company-with-change-date",
                descriptionValues: {
                    change_date: "2010-02-12",
                    officer_name: "Thomas David Wheare"
                }
            };
            const result = mapFilingHistoryDescription(filing);
            expect(result).to.equal("Director's details changed for Thomas David Wheare on 12 February 2010");
        });

        it("should add the figure and currency if present in capital", () => {
            const filing: Filing = {
                description: "capital-allotment-shares",
                descriptionValues: {
                    date: "2011-06-30",
                    capital: [
                        {
                            figure: "113,691,167",
                            currency: "GBP"
                        }
                    ]
                }
            };
            const result = mapFilingHistoryDescription(filing);
            expect(result).to.equal("Statement of capital following an allotment of shares on 30 June 2011<ul class='govuk-list'><li>GBP 113,691,167</li></ul>");
        });

        it("Should add capital with date", () => {
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
                }
            };
            const result = mapFilingHistoryDescription(filing);
            expect(result).to.equal("Purchase of own shares. Shares purchased into treasury:<ul class='govuk-list'><li>GBP 121,728,680.5 on 2011-07-26</li></ul>");
        });

        it("should add alt_capital if present", () => {
            const filing: Filing = {
                description: "capital-cancellation-treasury-shares-with-date-currency-capital-figure",
                descriptionValues: {
                    capital: [
                        {
                            figure: "1,387,104,846.75",
                            currency: "GBP",
                            date: "2011-12-28"
                        }
                    ],
                    date: "2011-12-28",
                    alt_capital: [
                        {
                            description: "capital-cancellation-treasury-shares-with-date-treasury-capital-figure",
                            currency: "GBP",
                            figure: "121,608,341.25",
                            date: "2011-12-13"
                        }
                    ]
                }
            };
            const result = mapFilingHistoryDescription(filing);
            expect(result).to.equal("Statement of capital on 28 December 2011<ul class='govuk-list'><li>GBP 1,387,104,846.75</li></ul><ul class='govuk-list'>Cancellation of treasury shares. Treasury capital:<li>GBP 121,608,341.25 on 2011-12-13</li></ul>");
        });
    });

    describe("removeAsterisks", () => {
        it("should remove asterisks in text", () => {
            const text = "**Appointment** of ";
            const result = removeAsterisks(text);
            expect(result).to.equal("Appointment of ");
        });
    });

    describe("mapDateFullMonth", () => {
        it("should map date from 2010-02-12 to 12 February 2010", () => {
            const date = "2010-02-12";
            const result = mapDateFullMonth(date);
            expect(result).to.equal("12 February 2010");
        });
    });
});
