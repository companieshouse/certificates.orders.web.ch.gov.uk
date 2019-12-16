import app from "../../app";
import * as request from "supertest";  

const GOOD_STANDING_OPTION_NOT_SELECTED = "Select if you want good standing information on the certificate"
const GOOD_STANDING_URL = "/orderable/certificates/good-standing"

describe("good standing url test", () => {

  it("renders the good standing web page", async () => {
    // dispatch a request to the homepage using supertest
    const resp = await request(app).get(GOOD_STANDING_URL);

    // make some assertions on the response
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Do you want good standing information");
  });
});

describe("good standing validation test", () => {

    it("should receive error message instructing user to select an option", async () => {
        const res = await request(app).post(GOOD_STANDING_URL)
        expect(res.status).toEqual(200);
        expect(res.text).toContain(GOOD_STANDING_OPTION_NOT_SELECTED)
    })
});