import User, { IUserDoc } from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { UserSchema } from "@/lib/validations";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

// GET /api/users/:id
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await dbConnect();
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id}`);
    }

    const response: APIResponse<IUserDoc> = {
      success: true,
      data: user,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

// DELETE /api/users/:id
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // check if the id is a valid ObjectId
    if (!isValidObjectId(id)) {
      throw new ValidationError({ id: ["Invalid ObjectId for user id"] });
    }

    await dbConnect();

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundError(`User with id ${id}`);
    }

    const response: APIResponse<IUserDoc> = {
      success: true,
      data: user,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

// PUT /api/users/:id
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  try {
    await dbConnect();

    const validatedData = UserSchema.safeParse(body);
    if (!validatedData.success) {
      const flattened = z.flattenError(validatedData.error);
      throw new ValidationError(flattened.fieldErrors);
    }

    const user = await User.findByIdAndUpdate(id, validatedData.data, { new: true });
    if (!user) {
      throw new NotFoundError(`User with id ${id}`);
    }

    const response: APIResponse<IUserDoc> = {
      success: true,
      data: user,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
