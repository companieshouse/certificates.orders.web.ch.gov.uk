import app from "../../app";
import * as request from "supertest";  
import * as pageURLs from "../../model/page.urls";

const ENTER_YOUR_FIRST_NAME = "Enter your first name"
const CHARACTER_LENGTH_TEXT = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
const CHARACTER_LENGTH_TEXT_ERROR = "must be 32 characters or fewer"
const INVALID_CHARACTER = "|"
const INVALID_CHARACTER_ERROR = "You have entered invalid characters"


describe("order details url test", () => {

  it("renders the order details web page", async () => {
    // dispatch a request to the homepage using supertest
    const resp = await request(app)
        .get(pageURLs.ORDER_DETAILS_FULL_URL);

    // make some assertions on the response
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Enter the name of the person making the order");
  });
});

describe("order details validation test", () => {

    it("should receive error message instructing user to select an option", async () => {
        const res = await request(app)
            .post(pageURLs.ORDER_DETAILS_FULL_URL)
        expect(res.status).toEqual(200);
        expect(res.text).toContain(ENTER_YOUR_FIRST_NAME)
    });


    it("should receive error message requesting less than 32 characters in input fields", async () => {
        const res = await request(app)
        .post(pageURLs.ORDER_DETAILS_FULL_URL)
        .set("Accept", "application/json")
        .send({
            firstName: CHARACTER_LENGTH_TEXT,
            lastName: CHARACTER_LENGTH_TEXT
        });
        expect(res.status).toEqual(200);
        expect(res.text).toContain("This page has errors");
    });

    it("should receive error message when entering invalid characters", async () => {
        const res = await request(app)
        .post(pageURLs.ORDER_DETAILS_FULL_URL)
        .set("Accept", "application/json")
        .send({
            firstName: INVALID_CHARACTER,
            lastName: INVALID_CHARACTER
        });
        expect(res.status).toEqual(200);
        expect(res.text).toContain("This page has errors");
    });
});
