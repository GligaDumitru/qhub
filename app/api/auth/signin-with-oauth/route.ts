import Account, { IAccountDoc } from "@/database/account.model";
import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validations";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import z from "zod";

export async function POST(request: NextRequest) {
  const { provider, providerAccountId, user } = await request.json();

  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validatedData = SignInWithOAuthSchema.safeParse({ provider, providerAccountId, user });
    if (!validatedData.success) {
      const flattened = z.flattenError(validatedData.error);
      throw new ValidationError(flattened.fieldErrors);
    }

    const { name, username, email, image } = user;

    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    let existingUser = await User.findOne({ email }).session(session);
    if (!existingUser) {
      [existingUser] = await User.create(
        [
          {
            name,
            username: slugifiedUsername,
            email,
            image,
          },
        ],
        { session }
      );
    } else {
      const updatedData: { name?: string; image?: string } = {};
      if (name !== existingUser.name) {
        updatedData.name = name;
      }
      if (image !== existingUser.image) {
        updatedData.image = image;
      }
      if (Object.keys(updatedData).length > 0) {
        existingUser = await User.findByIdAndUpdate(existingUser._id, updatedData, { new: true }).session(session);
      }
    }

    const existingAccount = await Account.findOne({ userId: existingUser._id, provider, providerAccountId }).session(
      session
    );

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    const response = {
      success: true,
      data: existingAccount,
    } as ActionResponse<IAccountDoc>;

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    await session.abortTransaction();
    return handleError(error, "api") as APIErrorResponse;
  } finally {
    session.endSession();
  }
}
