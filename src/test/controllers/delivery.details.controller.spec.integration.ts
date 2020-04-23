import {createRedisMock, getSignedInCookie} from "../utils/mock.redis";
jest.mock("ioredis", () => createRedisMock());

import app from "../../app";
import * as request from "supertest";
import {DELIVERY_DETAILS} from "../../model/page.urls";
import * as errorMessages from "../../model/error.messages";

const ENTER_YOUR_FIRST_NAME_NOT_INPUT = "Enter your first name";
const ENTER_YOUR_LAST_NAME_NOT_INPUT = "Enter your last name";
const ENTER_BUILDING_AND_STREET_LINE_ONE = "Enter a building and street";
const FIRST_NAME_INVALID_CHARACTER_ERROR = "First name cannot include";
const LAST_NAME_INVALID_CHARACTER_ERROR = "Last name cannot include";
const ADDRESS_LINE_ONE_INVALID_CHARACTERS_ERROR: string = "Address line 1 cannot include ";
const ADDRESS_LINE_TWO_INVALID_CHARACTERS_ERROR: string = "Address line 2 cannot include ";
const ADDRESS_TOWN_INVALID_CHARACTERS_ERROR: string = "Town or city cannot include ";
const ADDRESS_COUNTY_INVALID_CHARACTERS_ERROR: string = "County cannot include ";
const ADDRESS_POSTCODE_INVALID_CHARACTERS_ERROR: string = "Postcode cannot include ";
const ADDRESS_COUNTRY_INVALID_CHARACTERS_ERROR: string = "Country cannot include ";
const INVALID_CHARACTER: string = "|";
const CHARACTER_LENGTH_TEXT_50: string
    = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const POSTCODE: string = "CX14 1BX";
const COUNTY: string = "county";

describe("delivery details url test", () => {

  it("renders the delivery details web page", async () => {
    const resp = await request(app).get(DELIVERY_DETAILS).set("Cookie", [getSignedInCookie()]);
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("What are the delivery details?");
  });
});

describe("delivery details validation test", () => {

    it("should receive error message instructing user to input required fields", async () => {
        const res = await request(app).post(DELIVERY_DETAILS).set("Cookie", [getSignedInCookie()]);
        expect(res.status).toEqual(200);
        expect(res.text).toContain(ENTER_YOUR_FIRST_NAME_NOT_INPUT);
        expect(res.text).toContain(ENTER_YOUR_LAST_NAME_NOT_INPUT);
        expect(res.text).toContain(ENTER_BUILDING_AND_STREET_LINE_ONE);
        expect(res.text).toContain(errorMessages.ADDRESS_COUNTY_AND_POSTCODE_EMPTY)
    });
});

describe("delivery details validation", () => {

    it("should receive error message when entering invalid characters in all fields", async () => {
        const res = await request(app)
        .post(DELIVERY_DETAILS)
        .set("Accept", "application/json")
        .send({
            addressCountry: INVALID_CHARACTER,
            addressCounty: INVALID_CHARACTER,
            addressLineOne: INVALID_CHARACTER,
            addressLineTwo: INVALID_CHARACTER,
            addressPostcode: INVALID_CHARACTER,
            addressTown: INVALID_CHARACTER,
            firstName: INVALID_CHARACTER,
            lastName: INVALID_CHARACTER,
        })
        .set("Cookie", [getSignedInCookie()]);
        expect(res.status).toEqual(200);
        expect(res.text).toContain(FIRST_NAME_INVALID_CHARACTER_ERROR);
        expect(res.text).toContain(LAST_NAME_INVALID_CHARACTER_ERROR);
        expect(res.text).toContain(ADDRESS_LINE_ONE_INVALID_CHARACTERS_ERROR);
        expect(res.text).toContain(ADDRESS_LINE_TWO_INVALID_CHARACTERS_ERROR);
        expect(res.text).toContain(ADDRESS_TOWN_INVALID_CHARACTERS_ERROR);
        expect(res.text).toContain(ADDRESS_COUNTY_INVALID_CHARACTERS_ERROR);
        expect(res.text).toContain(ADDRESS_POSTCODE_INVALID_CHARACTERS_ERROR);
        expect(res.text).toContain(ADDRESS_COUNTRY_INVALID_CHARACTERS_ERROR);
    });

    it("should receive error messages requesting less than allowed character length in input fields", async () => {
        const res = await request(app)
        .post(DELIVERY_DETAILS)
        .send({
            addressCountry: CHARACTER_LENGTH_TEXT_50,
            addressCounty: CHARACTER_LENGTH_TEXT_50,
            addressLineOne: CHARACTER_LENGTH_TEXT_50,
            addressLineTwo: CHARACTER_LENGTH_TEXT_50,
            addressPostcode: CHARACTER_LENGTH_TEXT_50,
            addressTown: CHARACTER_LENGTH_TEXT_50,
            firstName: CHARACTER_LENGTH_TEXT_50,
            lastName: CHARACTER_LENGTH_TEXT_50,
        })
        .set("Cookie", [getSignedInCookie()]);
        expect(res.status).toEqual(200);
        expect(res.text).toContain(errorMessages.ORDER_DETAILS_FIRST_NAME_MAX_LENGTH);
        expect(res.text).toContain(errorMessages.ORDER_DETAILS_LAST_NAME_MAX_LENGTH);
        expect(res.text).toContain(errorMessages.ADDRESS_LINE_ONE_MAX_LENGTH);
        expect(res.text).toContain(errorMessages.ADDRESS_LINE_TWO_MAX_LENGTH);
        expect(res.text).toContain(errorMessages.ADDRESS_TOWN_MAX_LENGTH);
        expect(res.text).toContain(errorMessages.ADDRESS_COUNTY_MAX_LENGTH);
        expect(res.text).toContain(errorMessages.ADDRESS_POSTCODE_MAX_LENGTH);
        expect(res.text).toContain(errorMessages.ADDRESS_COUNTRY_MAX_LENGTH);

    });

    it("should not receive Postcode or county error message when postcode is input", async () => {
        const res = await request(app)
        .post(DELIVERY_DETAILS)
        .send({
            addressPostcode: POSTCODE,
        })
        .set("Cookie", [getSignedInCookie()]);
        expect(res.status).toEqual(200);
        expect(res.text).not.toContain(errorMessages.ADDRESS_COUNTY_AND_POSTCODE_EMPTY);
    });

    it("should not receive Postcode or county error message when county is input", async () => {
        const res = await request(app)
        .post(DELIVERY_DETAILS)
        .send({
            addressCounty: COUNTY,
        })
        .set("Cookie", [getSignedInCookie()]);
        expect(res.status).toEqual(200);
        expect(res.text).not.toContain(errorMessages.ADDRESS_COUNTY_AND_POSTCODE_EMPTY);
    });
});
