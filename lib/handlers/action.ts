"use server";

import { auth } from "@/auth";
import { Session } from "next-auth";
import z from "zod";
import { UnauthorizedError } from "../http-errors";
import dbConnect from "../mongoose";
import handleError from "./error";

type ActionOptions<T> = {
  params?: T;
  schema?: z.ZodType<T>;
  authorized?: boolean;
};

/**
 * Server action helper: validates input, optionally enforces auth, connects to the DB,
 * then returns validated params and session for the action body to use.
 *
 * @template T - Type of the action params (and the shape validated by `schema`).
 *
 * @param options - Configuration for the action.
 * @param options.params - Input to validate and pass through (e.g. form data or request body).
 * @param options.schema - Zod schema to validate `params`. If both `params` and `schema` are
 *   provided, validation runs and on failure returns an error response via `handleError` instead of throwing.
 * @param options.authorized - If `true`, runs `auth()` and throws `UnauthorizedError` when there is no session.
 *
 * @returns `{ params, session }` — `params` as provided (after validation if schema was used),
 *   and `session` from `auth()` when `authorized` is true, otherwise `null`. Always calls `dbConnect()` before returning.
 *
 * @throws {UnauthorizedError} When `authorized` is true and the user is not signed in.
 *
 * @example
 * const { params, session } = await action({
 *   params: formData,
 *   schema: MySchema,
 *   authorized: true,
 * });
 * await doSomething(params, session.user.id);
 */
async function action<T>({ params, schema, authorized = false }: ActionOptions<T>) {
  if (params && schema) {
    try {
      schema.parse(params);
    } catch (error) {
      return handleError(error);
    }
  }

  let session: Session | null = null;

  if (authorized) {
    session = await auth();
    if (!session) {
      throw new UnauthorizedError();
    }
  }

  await dbConnect();

  return { params, session };
}

export default action;
