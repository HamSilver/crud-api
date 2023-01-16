enum MESSAGE {
  BAD_REQUEST = '{ "message": "Request body does not contain required fields" }',
  NOT_FOUND = '{ "message": "Requested resource not found" }',
  INVALID_ID = '{ "message": "Invalid ID requested" }',
  SERVER_ERROR = '{ "message": "Server side error" }',
}

enum METHOD {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

enum CODE {
  C200 = 200,
  C201 = 201,
  C204 = 204,
  E400 = 400,
  E404 = 404,
  E500 = 500,
}

const ENDPOINT = "/api/users";

const HEADER_JSON = { "Content-Type": "application/json", Etag: "" };

const CMD = "refresh";

export { MESSAGE, METHOD, CODE, ENDPOINT, HEADER_JSON, CMD };
