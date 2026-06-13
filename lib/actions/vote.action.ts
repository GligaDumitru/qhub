"use server";

import ROUTES from "@/constants/routes";
import { Answer, Question } from "@/database";
import Vote from "@/database/vote.model";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import { CreateVoteSchema, HasVotedSchema, UpdateVoteCountSchema } from "../validations";
import { createInteraction } from "./interaction.action";

export async function updateVoteCount(
  params: UpdateVoteCountParams,
  session?: mongoose.ClientSession
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: UpdateVoteCountSchema });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType, change } = validationResult.params!;

  const Model = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";

  try {
    const result = await Model.findByIdAndUpdate(
      targetId,
      {
        $inc: {
          [voteField]: change,
        },
      },
      { new: true, session }
    );

    if (!result) {
      return handleError(new NotFoundError("Content not found")) as ErrorResponse;
    }

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(params: CreateVoteParams): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: CreateVoteSchema, authorize: true });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult.session?.user.id;
  if (!userId) {
    return handleError(new UnauthorizedError()) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const Model = targetType === "question" ? Question : Answer;
    const contentDoc = await Model.findById(targetId).session(session);
    if (!contentDoc) {
      throw new NotFoundError("Content not found");
    }

    const contentAuthorId = contentDoc.author.toString();

    const existingVote = await Vote.findOne({ author: userId, actionId: targetId, actionType: targetType }).session(
      session
    );
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // if the user has already voted on the same content with the same vote type, delete the vote
        await Vote.deleteOne({ _id: existingVote._id }).session(session);
        await updateVoteCount({ targetId, targetType, voteType, change: -1 }, session);
      } else {
        // if the user has already voted on the same content with a different vote type, update the vote
        await Vote.findByIdAndUpdate(existingVote._id, { voteType }, { new: true, session });
        await updateVoteCount({ targetId, targetType, voteType: existingVote.voteType, change: -1 }, session);
        await updateVoteCount({ targetId, targetType, voteType, change: 1 }, session);
      }
    } else {
      // if the user has not voted on the content, create a new vote
      await Vote.create([{ author: userId, actionId: targetId, actionType: targetType, voteType }], {
        session,
      });
      await updateVoteCount({ targetId, targetType, voteType, change: 1 }, session);
    }

    // log the interaction
    after(async () => {
      await createInteraction({
        action: voteType,
        actionId: targetId,
        actionTarget: targetType,
        authorId: contentAuthorId,
      });
    });

    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(targetId));
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function hasVoted(params: HasVotedParams): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({ params, schema: HasVotedSchema, authorize: true });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user.id;
  if (!userId) {
    return handleError(new UnauthorizedError()) as ErrorResponse;
  }

  const vote = await Vote.findOne({ author: userId, actionId: targetId, actionType: targetType });
  if (!vote) {
    return { success: true, data: { hasUpvoted: false, hasDownvoted: false } };
  }

  return {
    success: true,
    data: { hasUpvoted: vote.voteType === "upvote", hasDownvoted: vote.voteType === "downvote" },
  };
}
