import { Users } from "./users";

class Database {
  public users: Map<string, Users> = new Map<string, Users>();

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
}

export const Db = new Database();
