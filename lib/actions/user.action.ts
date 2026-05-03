"use server";

import { Answer, Question } from "@/database";
import User, { IUserDoc } from "@/database/user.model";
import { PipelineStage, QueryFilter, Types } from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import {
  GetUserQuestionsSchema,
  GetUsersAnswersSchema,
  GetUserSchema,
  GetUserTagsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

export async function getUsers(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ users: User[]; isNext: boolean }>> {
  const validationResult = await action({ params, schema: PaginatedSearchParamsSchema });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = validationResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: QueryFilter<IUserDoc> = {};

  if (query) {
    filterQuery.$or = [
      {
        name: {
          $regex: query,
          $options: "i",
        },
      },
      {
        email: {
          $regex: query,
          $options: "i",
        },
      },
    ];
  }

  let sortQuery = {};

  switch (filter) {
    case "newest":
      sortQuery = { createdAt: -1 };
      break;
    case "oldest":
      sortQuery = { createdAt: 1 };
      break;
    case "popular":
      sortQuery = { reputation: -1 };
      break;
    default:
      sortQuery = { reputation: -1 };
      break;
  }

  try {
    const totalUsers = await User.countDocuments(filterQuery);
    const users = await User.find(filterQuery).sort(sortQuery).skip(skip).limit(limit);
    const isNext = totalUsers > skip + limit;
    return { success: true, data: { users: JSON.parse(JSON.stringify(users)) as User[], isNext } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUser(params: GetUserParams): Promise<
  ActionResponse<{
    user: User;
    totalQuestions: number;
    totalAnswers: number;
  }>
> {
  const validationResult = await action({ params, schema: GetUserSchema });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = validationResult.params!;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with id ${userId}`);
    }

    const totalQuestions = await Question.countDocuments({ author: userId });
    const totalAnswers = await Answer.countDocuments({ author: userId });

    return {
      success: true,
      data: { user: JSON.parse(JSON.stringify(user)) as User, totalQuestions, totalAnswers },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserQuestions(
  params: GetUserQuestionsParams
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validationResult = await action({ params, schema: GetUserQuestionsSchema });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = validationResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const totalQuestions = await Question.countDocuments({ author: userId });
    const questions = await Question.find({ author: userId })
      .populate("tags", "name")
      .populate("author", "name image")
      .skip(skip)
      .limit(limit);
    const isNext = totalQuestions > skip + limit;
    return { success: true, data: { questions: JSON.parse(JSON.stringify(questions)) as Question[], isNext } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserAnswers(
  params: GetUserAnswersParams
): Promise<ActionResponse<{ answers: Answer[]; isNext: boolean }>> {
  const validationResult = await action({ params, schema: GetUsersAnswersSchema });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = validationResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const totalAnswers = await Answer.countDocuments({ author: userId });
    const answers = await Answer.find({ author: userId }).populate("author", "name image").skip(skip).limit(limit);
    const isNext = totalAnswers > skip + limit;
    return { success: true, data: { answers: JSON.parse(JSON.stringify(answers)) as Answer[], isNext } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserTags(params: GetUserTagsParams): Promise<
  ActionResponse<{
    tags: {
      _id: string;
      name: string;
      count: number;
    }[];
  }>
> {
  const validationResult = await action({ params, schema: GetUserTagsSchema });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = validationResult.params!;

  try {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          author: new Types.ObjectId(userId),
        },
      },
      {
        $unwind: "$tags",
      },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "_id",
          foreignField: "_id",
          as: "tagInfo",
        },
      },
      {
        $unwind: "$tagInfo",
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: "$tagInfo._id",
          name: "$tagInfo.name",
          count: 1,
        },
      },
    ];

    const tags = await Question.aggregate(pipeline);
    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)) as { _id: string; name: string; count: number }[],
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
