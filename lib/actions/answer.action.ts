"use server";
import ROUTES from "@/constants/routes";
import { Answer, Question } from "@/database";
import { IAnswerDoc } from "@/database/answer.model";
import mongoose, { QueryFilter } from "mongoose";
import { revalidatePath } from "next/cache";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import { AnswerServerSchema, GetAnswersSchema } from "../validations";

export async function createAnswer(params: CreateAnswerParams): Promise<ActionResponse<IAnswerDoc>> {
  const validationResult = await action({ params, schema: AnswerServerSchema, authorize: true });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { content, questionId } = validationResult.params!;
  const userId = validationResult.session?.user.id;
  if (!userId) {
    return handleError(new UnauthorizedError("You must be logged in to answer a question")) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new NotFoundError("Question not found");
    }

    const [answer] = await Answer.create([{ content, question: questionId, author: userId }], { session });
    if (!answer) {
      throw new Error("Failed to create answer");
    }

    question.answers += 1;
    await question.save({ session });
    await session.commitTransaction();

    revalidatePath(ROUTES.QUESTION(questionId));

    return { success: true, data: JSON.parse(JSON.stringify(answer)) as IAnswerDoc };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getAnswers(
  params: GetAnswersParams
): Promise<ActionResponse<{ answers: Answer[]; isNext: boolean }>> {
  const validationResult = await action({ params, schema: GetAnswersSchema, authorize: false });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId, page = 1, pageSize = 10, filter } = validationResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: QueryFilter<IAnswerDoc> = { question: questionId };

  let sortQuery = {};
  switch (filter) {
    case "newest":
      sortQuery = { createdAt: -1 };
      break;
    case "oldest":
      sortQuery = { createdAt: 1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
      break;
  }

  try {
    const totalAnswers = await Answer.countDocuments(filterQuery);
    const answers = await Answer.find(filterQuery)
      .populate("author", "_id name image")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);
    const isNext = totalAnswers > skip + limit;
    return { success: true, data: { answers: JSON.parse(JSON.stringify(answers)) as Answer[], isNext } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
