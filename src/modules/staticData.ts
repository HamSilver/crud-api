enum METHOD {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

enum ERROR {
  e400 = "400",
  e401 = "401",
  e404 = "404",
  e500 = "500",
}

const ENDPOINT = "/api/users";

const HEADER = "Content-Type";

enum CONTENT_TYPE {
  JSON = "application/json",
  TEXT = "text/plain",
}

const HEADER_JSON = { [HEADER]: CONTENT_TYPE.JSON };

const HEADER_TEXT = { [HEADER]: CONTENT_TYPE.TEXT };

export { METHOD, ERROR, ENDPOINT, HEADER_JSON, HEADER_TEXT };
