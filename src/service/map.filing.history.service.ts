/* eslint-disable camelcase */
import { getFullFilingHistoryDescription } from "../config/api.enumerations";
import { Filing } from "ch-sdk-node/dist/services/filing-history";

export const lookupFh = (descriptionKey: string, descriptionValues: Record<string, any>) => {
    const description = getFullFilingHistoryDescription(descriptionKey);
    return descriptionValues === undefined ? description : Object.entries(descriptionValues).reduce((newObj, [key, val]) => {
        const value = key.includes("date") ? mapDateFullMonth(val) : val;
        return newObj.replace("{" + key + "}", value as string);
    }, description);
};

export const mapFilingHistoryDescription = (filing: Filing) => {
    let filingHistoryDescription = "";
    if (filing?.descriptionValues?.description) {
        filingHistoryDescription += filing?.descriptionValues?.description;
    } else if (filing?.description && filing?.descriptionValues) {
        filingHistoryDescription += lookupFh(filing.description, filing.descriptionValues);
    }

    // capital
    if (filing?.descriptionValues?.capital) {
        filingHistoryDescription += "<ul class='govuk-list'>";
        filingHistoryDescription += filing?.descriptionValues?.capital.reduce((accum, capitalData) => {
            if (!capitalData.date || filing.description === "capital-cancellation-treasury-shares-with-date-currency-capital-figure" ||
                filing.description === "second-filing-capital-cancellation-treasury-shares-with-date-currency-capital-figure") {
                return `${accum}<li>${capitalData.currency} ${capitalData.figure}</li>`;
            } else {
                return `${accum}<li>${capitalData.currency} ${capitalData.figure} on ${capitalData.date}</li>`;
            }
        }, "");
        filingHistoryDescription += "</ul>";
    }

    // alt_capital
    if (filing?.descriptionValues?.alt_capital) {
        filingHistoryDescription += "<ul class='govuk-list'>";
        filingHistoryDescription += filing?.descriptionValues?.alt_capital.reduce((accum, capitalData, index) => {
            let alCapitalText = "";
            if (index === 0) {
                alCapitalText += lookupFh(capitalData.description, capitalData?.description_values);
            }
            console.log(alCapitalText);
            alCapitalText += `<li>${capitalData.currency} ${capitalData.figure}`;
            if (capitalData.date) {
                alCapitalText += ` on ${capitalData.date}`;
            }
            alCapitalText += "</li>";
            return accum + alCapitalText;
        }, "");
        filingHistoryDescription += "</ul>";
    }
    return removeAsterisks(filingHistoryDescription);
};

export const replaceVariables = (key, val, newObj) => {
    const value = key.includes("date") ? mapDateFullMonth(val) : val;
    return newObj.replace("{" + key + "}", value as string);
};

export const removeAsterisks = (description: string) => {
    return description.replace(/\*/g, "");
};

export const mapDateFullMonth = (dateString: string): string => {
    const d = new Date(dateString);
    const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
    const month = new Intl.DateTimeFormat("en", { month: "long" }).format(d);
    const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(d);

    return `${day} ${month} ${year}`;
};
