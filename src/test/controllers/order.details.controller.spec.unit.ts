import {createRedisMock, getSignedInCookie, getSignedOutCookie} from "../utils/mock.redis"
jest.mock('ioredis', () => createRedisMock());

import app from "../../app";
import * as request from "supertest";  
import {ORDER_DETAILS} from "../../model/page.urls";

const ENTER_YOUR_FIRST_NAME = "Enter your first name"
const CHARACTER_LENGTH_TEXT = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
const CHARACTER_LENGTH_TEXT_ERROR = "must be 32 characters or fewer"
const INVALID_CHARACTER = "|"
const FIRST_NAME_INVALID_CHARACTER_ERROR = "First name cannot include"
const LAST_NAME_INVALID_CHARACTER_ERROR = "Last name cannot include"


describe("order details url test", () => {

  it("renders the order details web page", async () => {
    // dispatch a request to the homepage using supertest
    const resp = await request(app)
        .get(ORDER_DETAILS)
        .set('Cookie', [getSignedInCookie()]);;
    // make some assertions on the response
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Enter the name of the person making the order");
  });
});

describe("order details validation test", () => {

    it("should receive error message instructing user to select an option", async () => {
        const res = await request(app)
        .post(ORDER_DETAILS)
        .set('Cookie', [getSignedInCookie()]);
        expect(res.status).toEqual(200);
        expect(res.text).toContain(ENTER_YOUR_FIRST_NAME)
    });


    it("should receive error message requesting less than 32 characters in input fields", async () => {
        const res = await request(app)
        .post(ORDER_DETAILS)
        .send({
            firstName: CHARACTER_LENGTH_TEXT,
            lastName: CHARACTER_LENGTH_TEXT
        })
        .set('Cookie', [getSignedInCookie()]);
        expect(res.status).toEqual(200);
        expect(res.text).toContain(CHARACTER_LENGTH_TEXT_ERROR);
    });

    it("should receive error message when entering invalid characters for first name", async () => {
        const res = await request(app)
        .post(ORDER_DETAILS)
        .set("Accept", "application/json")
        .send({
            firstName: INVALID_CHARACTER
        })
        .set('Cookie', [getSignedInCookie()]);
        
        expect(res.status).toEqual(200);
        expect(res.text).toContain(FIRST_NAME_INVALID_CHARACTER_ERROR);
    });

    it("should receive error message when entering invalid characters for last name", async () => {
        const res = await request(app)
        .post(ORDER_DETAILS)
        .set("Accept", "application/json")
        .send({
            lastName: INVALID_CHARACTER
        })
        .set('Cookie', [getSignedInCookie()]);

        expect(res.status).toEqual(200);
        expect(res.text).toContain(LAST_NAME_INVALID_CHARACTER_ERROR);
    });
});
