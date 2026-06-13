"use server";

import { User } from "@/database";
import Interaction, { IInteractionDoc } from "@/database/interaction.model";
import mongoose from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { UnauthorizedError } from "../http-errors";
import { CreateInteractionSchema } from "../validations";

async function updateReputation(params: UpdateReputationParams) {
  const { interaction, session, performerId, authorId } = params;
  const { action, actionType } = interaction;

  let performerReputation = 0;
  let authorReputation = 0;

  switch (action) {
    case "upvote":
      performerReputation = 2;
      authorReputation = 10;
      break;
    case "downvote":
      performerReputation = -1;
      authorReputation = -2;
      break;
    case "post":
      authorReputation = actionType === "question" ? 5 : 10;
      break;
    case "delete":
      authorReputation = actionType === "question" ? -5 : -10;
      break;
  }

  if (performerId === authorId) {
    await User.findByIdAndUpdate(performerId, { $inc: { reputation: authorReputation } }, { session });
    return;
  }

  await User.bulkWrite(
    [
      {
        updateOne: {
          filter: { _id: performerId },
          update: { $inc: { reputation: performerReputation } },
          ...(session && { session }),
        },
      },
      {
        updateOne: {
          filter: { _id: authorId },
          update: { $inc: { reputation: authorReputation } },
          ...(session && { session }),
        },
      },
    ],
    { session }
  );
}

export async function createInteraction(params: CreateInteractionParams): Promise<ActionResponse<IInteractionDoc>> {
  const validationResult = await action({ params, schema: CreateInteractionSchema, authorize: true });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { action: actionType, actionTarget, actionId, authorId } = validationResult.params!;

  const userId = validationResult.session?.user.id;
  if (!userId) {
    return handleError(new UnauthorizedError()) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [interaction] = await Interaction.create([{ action: actionType, actionTarget, actionId, author: authorId }], {
      session,
    });
    // Update reputation for both the performer and the content author
    await updateReputation({
      interaction,
      session,
      performerId: userId!,
      authorId,
    });

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(interaction)) as IInteractionDoc };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
