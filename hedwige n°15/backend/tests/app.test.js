// tests/app.test.js
jest.mock("connect-mongo", () => {
  const session = require("express-session");
  class MockStore extends session.Store {
    constructor() {
      super();
    }
    get(sid, callback) { callback(null, null); }
    set(sid, sess, callback) { callback(null); }
    destroy(sid, callback) { callback(null); }
  }
  return { create: () => new MockStore() };
});jest.mock("mongoose", () => ({ connect: jest.fn() }));

const request = require("supertest");
const app = require("../index");

describe("Hedwige backend - Gmail / Calendar / Logout", () => {

  test("GET /me sans connexion renvoie 401", async () => {
    const res = await request(app).get("/me");
    expect(res.status).toBe(401);
  });

  test("GET /logout sans connexion redirige vers frontend", async () => {
    const res = await request(app).get("/logout");
    expect(res.status).toBe(302);
  });

  test("GET /gmail sans connexion renvoie 401", async () => {
    const res = await request(app).get("/gmail");
    expect(res.status).toBe(401);
  });

  test("GET /calendar sans connexion renvoie 401", async () => {
    const res = await request(app).get("/calendar");
    expect(res.status).toBe(401);
  });

});
