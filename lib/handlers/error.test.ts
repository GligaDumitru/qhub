/**
 * @jest-environment node
 */
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import { z } from "zod";
import handleError, { formatResponse } from "./error";

// handleError logs every branch via lib/logger (pino); mock it so tests assert
// behavior, not real log side effects, and don't spam pretty-printed output.
jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: { error: jest.fn(), warn: jest.fn(), info: jest.fn() },
}));

describe("formatResponse", () => {
  test("returns a plain object (not a NextResponse) for responseType 'server'", () => {
    const result = formatResponse("server", 404, "Not found", { field: ["bad"] });
    expect(result).toEqual({
      status: 404,
      success: false,
      error: { message: "Not found", details: { field: ["bad"] } },
    });
  });

  test("returns a NextResponse with the given status for responseType 'api'", async () => {
    const result = formatResponse("api", 500, "Server error");
    if (!(result instanceof Response)) throw new Error("expected a NextResponse");

    expect(result.status).toBe(500);
    const body = await result.json();
    expect(body).toEqual({ success: false, error: { message: "Server error", details: undefined } });
  });
});

describe("handleError", () => {
  test("formats a RequestError subclass using its own statusCode/message/errors", () => {
    const result = handleError(new NotFoundError("Question"), "server");
    expect(result).toEqual({
      status: 404,
      success: false,
      error: { message: "Question not found", details: undefined },
    });
  });

  test("formats a ValidationError, preserving its field-level details", () => {
    const result = handleError(new ValidationError({ email: ["Required"] }), "server");
    expect(result).toEqual({
      status: 400,
      success: false,
      error: { message: "Email is required", details: { email: ["Required"] } },
    });
  });

  test("converts a raw ZodError into a 400 validation response with flattened field errors", () => {
    const schema = z.object({ email: z.email() });
    const parseResult = schema.safeParse({ email: "not-an-email" });
    if (parseResult.success) throw new Error("expected parse to fail");

    const result = handleError(parseResult.error, "server");
    if (result instanceof Response) throw new Error("expected a plain object, not a NextResponse");

    expect(result.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error.details).toHaveProperty("email");
  });

  test("wraps a plain Error as a 500 internal server error, keeping its message", () => {
    const result = handleError(new Error("Database connection failed"), "server");
    expect(result).toEqual({
      status: 500,
      success: false,
      error: { message: "Database connection failed", details: undefined },
    });
  });

  test("falls back to a generic 500 message for a non-Error thrown value", () => {
    const result = handleError("just a string", "server");
    expect(result).toEqual({
      status: 500,
      success: false,
      error: { message: "An unexpected error occurred", details: undefined },
    });
  });

  test("defaults to responseType 'server' when none is provided", () => {
    const result = handleError(new NotFoundError("Question"));
    expect(result).not.toBeInstanceOf(Response);
    expect(result).toMatchObject({ status: 404 });
  });

  test("returns a NextResponse for responseType 'api'", async () => {
    const result = handleError(new NotFoundError("Question"), "api");
    expect(result).toBeInstanceOf(Response);
    expect(result.status).toBe(404);
  });
});
