import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { InternalServerError, RequestError, ValidationError } from "../http-errors";

export type ResponseType = "api" | "server";

export const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]>
) => {
  const responseContent = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  if (responseType === "api") {
    return NextResponse.json(responseContent, { status });
  }

  return { status, ...responseContent };
};

const handleError = (error: unknown, responseType: ResponseType = "server") => {
  if (error instanceof RequestError) {
    return formatResponse(responseType, error.statusCode, error.message, error.errors);
  }

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    error.issues.forEach((issue) => {
      const path = issue.path.join(".");

      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }

      fieldErrors[path].push(issue.message);
    });

    const validationError = new ValidationError(fieldErrors);

    return formatResponse(responseType, validationError.statusCode, validationError.message, validationError.errors);
  }

  if (error instanceof Error) {
    const internalError = new InternalServerError(error.message);
    return formatResponse(responseType, internalError.statusCode, internalError.message);
  }

  return formatResponse(responseType, 500, "An unexpected error occurred");
};

export default handleError;
