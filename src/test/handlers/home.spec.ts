import app from "../../app";
import * as request from "supertest";

describe("home handler", () => {
  it("renders the start page", async () => {
    // dispatch a request to the homepage using supertest
    const resp = await request(app).get("/orderable/certificates");

    // make some assertions on the response
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Order a certificate");
  });
});
