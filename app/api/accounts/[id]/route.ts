import Account, { type IAccountDoc } from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validations";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

// GET /api/accounts/:id
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    if (!isValidObjectId(id)) {
      throw new ValidationError({ id: ["Invalid ObjectId for account id"] });
    }
    await dbConnect();
    const account = await Account.findById(id);
    if (!account) {
      throw new NotFoundError(`Account with id ${id}`);
    }

    const response: APIResponse<IAccountDoc> = {
      success: true,
      data: account,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

// DELETE /api/accounts/:id
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    if (!isValidObjectId(id)) {
      throw new ValidationError({ id: ["Invalid ObjectId for account id"] });
    }
    await dbConnect();
    const account = await Account.findByIdAndDelete(id);
    if (!account) {
      throw new NotFoundError(`Account with id ${id}`);
    }

    const response: APIResponse<IAccountDoc> = {
      success: true,
      data: account,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

// PUT /api/accounts/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  try {
    if (!isValidObjectId(id)) {
      throw new ValidationError({ id: ["Invalid ObjectId for account id"] });
    }
    await dbConnect();

    const validatedData = AccountSchema.partial().safeParse(body);
    if (!validatedData.success) {
      const flattened = z.flattenError(validatedData.error);
      throw new ValidationError(flattened.fieldErrors);
    }

    const account = await Account.findByIdAndUpdate(id, validatedData.data, { new: true });
    if (!account) {
      throw new NotFoundError(`Account with id ${id}`);
    }

    const response: APIResponse<IAccountDoc> = {
      success: true,
      data: account,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
