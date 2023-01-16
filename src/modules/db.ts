import { Users } from "./users.js";

class Database {
  users: Map<string, Users> = new Map<string, Users>();

  getAll(): Users[] {
    return [...this.users.values()];
  }

  getById(id: string): Users | undefined {
    return this.users.has(id) ? this.users.get(id) : undefined;
  }

  remove(id: string): boolean {
    return this.users.delete(id);
  }

  create(username: string, age: number, hobbies: string[]): Users {
    const newUser = new Users(username, age, hobbies);
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  update(user: Users): boolean {
    if (this.users.has(user.id)) {
      this.users.set(user.id, user);
      return true;
    }
    return false;
  }

  isUserValid(user: unknown): user is Users {
    const username: string = (user as Users).username;
    const age: number = (user as Users).age;
    const hobbies: string[] = (user as Users).hobbies;

    return !user ||
      typeof user !== "object" ||
      !username ||
      typeof username !== "string" ||
      !age ||
      typeof age !== "number" ||
      !Array.isArray(hobbies) ||
      hobbies.some((item) => typeof item !== "string")
      ? false
      : true;
  }

  async load(json: string): Promise<void> {
    this.users = new Map<string, Users>(Object.entries(await JSON.parse(json)));
  }

  async toJSON(): Promise<string> {
    return await JSON.stringify(Object.fromEntries(this.users));
  }
}

export const db = new Database();
