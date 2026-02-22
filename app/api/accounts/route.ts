import Account, { type IAccountDoc } from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { ForbiddenError, ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// GET /api/accounts
export async function GET() {
  try {
    await dbConnect();

    const accounts = await Account.find();

    const response: APIResponse<IAccountDoc[]> = {
      success: true,
      data: accounts,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

// POST /api/accounts
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const validatedData = AccountSchema.safeParse(body);
    if (!validatedData.success) {
      const flattened = z.flattenError(validatedData.error);
      throw new ValidationError(flattened.fieldErrors);
    }

    const existingAccount = await Account.findOne({
      provider: validatedData.data.provider,
      providerAccountId: validatedData.data.providerAccountId,
    });
    if (existingAccount) {
      throw new ForbiddenError(`An account with the same provider and provider account ID already exists`);
    }

    const newAccount = await Account.create(validatedData.data);
    const response: APIResponse<IAccountDoc> = {
      success: true,
      data: newAccount,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
