import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  RequestError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/http-errors";

describe("RequestError", () => {
  test("sets statusCode, message, and errors, and is a real Error instance", () => {
    const error = new RequestError(418, "I'm a teapot", { field: ["bad"] });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RequestError);
    expect(error.statusCode).toBe(418);
    expect(error.message).toBe("I'm a teapot");
    expect(error.errors).toEqual({ field: ["bad"] });
    expect(error.name).toBe("RequestError");
  });
});

describe("ValidationError", () => {
  test("formats a single 'Required' field error", () => {
    const error = new ValidationError({ email: ["Required"] });

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Email is required");
    expect(error.errors).toEqual({ email: ["Required"] });
  });

  test("formats non-'Required' field messages by joining them", () => {
    const error = new ValidationError({ password: ["Too short", "Missing a number"] });
    expect(error.message).toBe("Too short and Missing a number");
  });

  test("joins multiple fields with a comma", () => {
    const error = new ValidationError({
      email: ["Required"],
      password: ["Too short"],
    });
    expect(error.message).toBe("Email is required, Too short");
  });

  test("capitalizes the field name in the 'Required' message", () => {
    const error = new ValidationError({ username: ["Required"] });
    expect(error.message).toBe("Username is required");
  });
});

describe("NotFoundError", () => {
  test("builds a 404 message from the resource name", () => {
    const error = new NotFoundError("Question");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Question not found");
    expect(error.name).toBe("NotFoundError");
  });
});

describe("ForbiddenError", () => {
  test("defaults to a generic 'Forbidden' message", () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Forbidden");
  });

  test("accepts a custom message", () => {
    const error = new ForbiddenError("You can't edit this question");
    expect(error.message).toBe("You can't edit this question");
  });
});

describe("UnauthorizedError", () => {
  test("defaults to a generic 'Unauthorized' message", () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe("Unauthorized");
  });
});

describe("InternalServerError", () => {
  test("defaults to a generic 500 message", () => {
    const error = new InternalServerError();
    expect(error.statusCode).toBe(500);
    expect(error.message).toBe("Internal Server Error");
  });

  test("accepts a custom message", () => {
    const error = new InternalServerError("Database connection failed");
    expect(error.message).toBe("Database connection failed");
  });
});
