import Account, { type IAccountDoc } from "@/database/account.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { AccountSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// POST /api/accounts/provider
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    const validated = AccountSchema.partial().safeParse(body);
    if (!validated.success) {
      const flattened = z.flattenError(validated.error);
      throw new ValidationError(flattened.fieldErrors);
    }

    const { providerAccountId } = validated.data;
    const account = await Account.findOne({ providerAccountId });
    if (!account) {
      throw new NotFoundError(`Account with provider account ID ${providerAccountId}`);
    }

    const response: APIResponse<IAccountDoc[]> = {
      success: true,
      data: account,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
