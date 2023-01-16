import { v4 as uuidv4 } from "uuid";

export class Users {
  id: string = uuidv4();
  username: string = "";
  age: number = 0;
  hobbies: string[] = [];

  constructor(username = "", age = 0, hobbies: string[] = []) {
    this.username = username;
    this.age = age;
    this.hobbies = [...hobbies];
  }
}
