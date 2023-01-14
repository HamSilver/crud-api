import request from "supertest";
import { server } from "../dist/index.js";

const mockUser = [
  {
    username: "First User",
    age: 18,
    hobbies: ["ironing", "cooking"],
  },
  {
    username: "Second User",
    age: 36,
    hobbies: ["sleeping", "eating"],
  },
];

afterAll(() => server.server.close());

describe("Test requests to server", () => {
  it("should return an empty array", async () => {
    const res = await request(server.server).get("/api/users").send();
    expect(res.body).toEqual([]);
  });

  it("should return created object", async () => {
    const res = await request(server.server)
      .post("/api/users")
      .send(mockUser[0]);
    mockUser[0].id = res.body.id;
    mockUser[1].id = res.body.id;
    expect(mockUser[0].id).toMatch(/^(\w|\-)+$/);
    expect(res.body).toMatchObject(mockUser[0]);
  });

  it("should return user with requested id", async () => {
    const res = await request(server.server)
      .get(`/api/users/${mockUser[0].id}`)
      .send();
    expect(res.body).toMatchObject(mockUser[0]);
  });

  it("should return updated user", async () => {
    const res = await request(server.server)
      .put(`/api/users/${mockUser[1].id}`)
      .send(mockUser[1]);
    expect(res.body).toMatchObject(mockUser[1]);
  });

  it("should return response code 204", async () => {
    const res = await request(server.server)
      .delete(`/api/users/${mockUser[1].id}`)
      .send();
    expect(res.statusCode).toBe(204);
  });

  it("should return error message with code 404", async () => {
    const res = await request(server.server)
      .get(`/api/users/${mockUser[0].id}`)
      .send();
    expect(res.body).toMatchObject({ message: "Requested resource not found" });
    expect(res.statusCode).toBe(404);
  });
});
