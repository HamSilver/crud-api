import request from "supertest";
import { server } from "../dist/index.js";

const mockUser = [
  {
    username: "",
    age: 18,
    hobbies: [],
  },
  {
    username: "Second User",
    age: "36",
    hobbies: ["sleeping", "eating"],
  },
  {
    username: "3rd User",
    age: 36,
    hobbies: ["0", 1, "2"],
  },
];

afterAll(() => server.server.close());

describe("Test to errors", () => {
  it("should return error message with code 404 on wrong endpoint", async () => {
    const res = await request(server.server).get("/api/uzers").send();
    expect(res.body).toMatchObject({ message: "Requested resource not found" });
    expect(res.statusCode).toBe(404);
  });

  it("should return error message with code 404 on wrong method", async () => {
    const res = await request(server.server).options("/api/users").send();
    expect(res.body).toMatchObject({ message: "Requested resource not found" });
    expect(res.statusCode).toBe(404);
  });

  it("should return error message with code 400 on wrong id", async () => {
    const res = await request(server.server).get("/api/users/123").send();
    expect(res.body).toMatchObject({ message: "Invalid ID requested" });
    expect(res.statusCode).toBe(400);
  });

  it("should return error message with code 400 on wrong username in post", async () => {
    const res = await request(server.server)
      .post("/api/users")
      .send(mockUser[0]);
    expect(res.body).toMatchObject({
      message: "Request body does not contain required fields",
    });
    expect(res.statusCode).toBe(400);
  });

  it("should return error message with code 400 on wrong age in post", async () => {
    const res = await request(server.server)
      .post("/api/users")
      .send(mockUser[1]);
    expect(res.body).toMatchObject({
      message: "Request body does not contain required fields",
    });
    expect(res.statusCode).toBe(400);
  });

  it("should return error message with code 400 on wrong hobbies in post", async () => {
    const res = await request(server.server)
      .post("/api/users")
      .send(mockUser[2]);
    expect(res.body).toMatchObject({
      message: "Request body does not contain required fields",
    });
    expect(res.statusCode).toBe(400);
  });
});
