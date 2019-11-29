import app from "../../app";
import * as request from "supertest";

describe("home handler", () => {
  it("renders a greeting message", async () => {
    // dispatch a request to the homepage using supertest
    const resp = await request(app).get("/");

    // make some assertions on the response
    expect(resp.status).toEqual(200);
    expect(resp.text).toContain("Hello World");
  });
});
