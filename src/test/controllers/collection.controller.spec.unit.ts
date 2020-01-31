import app from "../../app";
import * as request from "supertest";  

const COLLECTION_OPTION_NOT_SELECTED = "Select the Companies House office you want to collect your certificate from"
const COLLECTION_URL = "/orderable/certificates/collection"

describe("collection url test", () => {

  it("renders the collection web page", async () => {
    const resp = await request(app).get(COLLECTION_URL);

    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Which Companies House office do you want to collect from?");
  });
});

describe("collection validation test", () => {

    it("should receive error message instructing user to select an option", async () => {
        const res = await request(app).post(COLLECTION_URL)
        expect(res.status).toEqual(200);
        expect(res.text).toContain(COLLECTION_OPTION_NOT_SELECTED)
    })
});