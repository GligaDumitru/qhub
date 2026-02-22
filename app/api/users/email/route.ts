import User, { IUserDoc } from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { UserSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// POST /api/users/email
export async function POST(request: NextRequest) {
  const { email } = await request.json();

  try {
    const validatedData = UserSchema.partial().safeParse({ email });
    if (!validatedData.success) {
      const flattened = z.flattenError(validatedData.error);
      throw new ValidationError(flattened.fieldErrors);
    }

    await dbConnect();

    const existingUserEmail = await User.findOne({ email });
    if (!existingUserEmail) {
      throw new NotFoundError(`Email ${email}`);
    }

    const response: APIResponse<IUserDoc> = {
      success: true,
      data: existingUserEmail,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
