import mongoose from "mongoose";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";
import { InternalServerError, RequestError, ValidationError } from "../http-errors";
import logger from "../logger";

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
  if (error instanceof mongoose.mongo.MongoServerError) {
    logger.error({ err: error }, `MongoDB Server Error: ${error.message}`);
  }
  if (error instanceof RequestError) {
    logger.error({ err: error }, `${responseType.toUpperCase()} Error: ${error.message}`);
    return formatResponse(responseType, error.statusCode, error.message, error.errors);
  }

  if (error instanceof ZodError) {
    const flattened = z.flattenError(error);
    const validationError = new ValidationError(flattened.fieldErrors as Record<string, string[]>);

    logger.error({ err: error }, `Validation Error: ${validationError.message}`);
    return formatResponse(responseType, validationError.statusCode, validationError.message, validationError.errors);
  }

  if (error instanceof Error) {
    const internalError = new InternalServerError(error.message);
    logger.error(error.message);
    return formatResponse(responseType, internalError.statusCode, internalError.message);
  }

  logger.error({ err: error }, "An unexpected error occurred");
  return formatResponse(responseType, 500, "An unexpected error occurred");
};

export default handleError;
