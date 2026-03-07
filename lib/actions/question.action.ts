"use server";

import Question, { IQuestionDoc } from "@/database/question.model";
import TagQuestion from "@/database/tag-question.model";
import Tag, { ITagDoc } from "@/database/tag.model";
import mongoose, { QueryFilter } from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

export async function createQuestion(params: CreateQuestionParams): Promise<ActionResponse<IQuestionDoc>> {
  const validationResult = await action({ params, schema: AskQuestionSchema, authorize: true });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult.session?.user.id;
  if (!userId) {
    return handleError(new UnauthorizedError()) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [question] = await Question.create([{ title, content, author: new mongoose.Types.ObjectId(userId) }], {
      session,
    });
    if (!question) {
      throw new Error("Failed to create question");
    }

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocuments = [];

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { new: true, upsert: true, session }
      );

      tagIds.push(existingTag._id);
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }

    await TagQuestion.insertMany(tagQuestionDocuments, { session });
    await Question.findByIdAndUpdate(
      question._id,
      {
        $push: { tags: { $each: tagIds } },
      },
      { session }
    );

    await session.commitTransaction();

    const result = {
      success: true,
      data: JSON.parse(JSON.stringify(question)) as IQuestionDoc,
    } as ActionResponse<IQuestionDoc>;
    return result;
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function editQuestion(params: EditQuestionParams): Promise<ActionResponse<IQuestionDoc>> {
  const validationResult = await action({ params, schema: EditQuestionSchema, authorize: true });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult.session?.user.id;
  if (!userId) {
    return handleError(new UnauthorizedError()) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const question = await Question.findById(questionId).populate("tags");
    if (!question) {
      throw new NotFoundError("Question not found");
    }

    if (question.author.toString() !== userId) {
      throw new UnauthorizedError("You are not authorized to edit this question");
    }

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    const tagsToAdd: string[] = tags.filter((tag: string) => !(question.tags as ITagDoc[]).some((t) => t.name === tag));
    const tagsToRemove: ITagDoc[] = (question.tags as ITagDoc[]).filter(
      (tag: ITagDoc) => !tags.includes(tag.name.toLocaleLowerCase())
    );

    const newTagDocuments = [];

    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { new: true, upsert: true, session }
        );
        if (existingTag) {
          newTagDocuments.push({ tag: existingTag._id, question: questionId });
          question.tags.push(existingTag._id);
        }
      }
    }

    if (tagsToRemove.length > 0) {
      const tagIdsToRemove: mongoose.Types.ObjectId[] = tagsToRemove.map((tag: ITagDoc) => tag._id);

      await Tag.updateMany(
        {
          _id: { $in: tagIdsToRemove },
        },
        {
          $inc: { questions: -1 },
        },
        { session }
      );

      await TagQuestion.deleteMany(
        {
          tag: { $in: tagIdsToRemove },
          question: questionId,
        },
        { session }
      );

      question.tags = question.tags.filter((tag: ITagDoc) => !tagIdsToRemove.includes(tag._id));
    }

    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, { session });
    }

    await question.save({ session });

    await session.commitTransaction();

    const result = {
      success: true,
      data: JSON.parse(JSON.stringify(question)) as IQuestionDoc,
    } as ActionResponse<IQuestionDoc>;
    return result;
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}

export async function getQuestion(params: GetQuestionParams): Promise<ActionResponse<Question>> {
  const validationResult = await action({ params, schema: GetQuestionSchema, authorize: false });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId).populate("tags").populate("author", "_id name image");
    if (!question) {
      throw new NotFoundError("Question not found");
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: Question[]; isNext: boolean }>> {
  const validationResult = await action({ params, schema: PaginatedSearchParamsSchema, authorize: false });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter, sort } = validationResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: QueryFilter<IQuestionDoc> = {};

  if (filter === "recommended") {
    return { success: true, data: { questions: [] as Question[], isNext: false } };
  }

  if (query) {
    const queryFindRegex = new RegExp(query, "i");
    filterQuery.$or = [{ title: queryFindRegex }, { content: queryFindRegex }];
  }

  let sortQuery = {};

  switch (sort) {
    case "newest":
      sortQuery = { createdAt: -1 };
      break;
    case "unanswered":
      filterQuery.answers = { $eq: 0 };
      sortQuery = { createdAt: -11 };
      break;
    case "popular":
      sortQuery = { upvotes: -1 };
      break;
    default:
      sortQuery = { createdAt: -1 };
      break;
  }

  try {
    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean()
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + limit;

    return { success: true, data: { questions: JSON.parse(JSON.stringify(questions)) as Question[], isNext } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function incrementQuestionView(params: IncrementQuestionViewParams): Promise<ActionResponse<Question>> {
  const validationResult = await action({ params, schema: IncrementViewsSchema, authorize: false });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;

  try {
    const question = await Question.findById(questionId);

    if (!question) {
      throw new NotFoundError("Question not found");
    }

    question.views += 1;
    await question.save();

    return { success: true, data: question };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
