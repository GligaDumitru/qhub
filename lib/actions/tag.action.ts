import { Question } from "@/database";
import Tag, { ITagDoc } from "@/database/tag.model";
import { QueryFilter } from "mongoose";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import { GetTagQuestionsSchema, PaginatedSearchParamsSchema } from "../validations";

export async function getTags(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    tags: Tag[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({ params, schema: PaginatedSearchParamsSchema, authorize: false });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { page = 1, pageSize = 10, query, sort } = validationResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: QueryFilter<ITagDoc> = {};

  if (query) {
    filterQuery.$or = [
      {
        name: {
          $regex: query,
          $options: "i",
        },
      },
    ];
  }

  let sortQuery = {};

  switch (sort) {
    case "popular":
      sortQuery = { questions: -1 };
      break;
    case "recent":
      sortQuery = { createdAt: -1 };
      break;
    case "oldest":
      sortQuery = { createdAt: 1 };
      break;
    case "name":
      sortQuery = { name: 1 };
      break;
    default:
      sortQuery = { questions: -1 };
      break;
  }

  try {
    const totalTags = await Tag.countDocuments(filterQuery);

    const tags = await Tag.find(filterQuery).sort(sortQuery).skip(skip).limit(limit);

    const isNext = totalTags > skip + limit;

    return { success: true, data: { tags: JSON.parse(JSON.stringify(tags)) as Tag[], isNext } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getTagQuestions(
  params: GetTagQuestionsParams
): Promise<ActionResponse<{ tag: Tag; questions: Question[]; isNext: boolean }>> {
  const validationResult = await action({ params, schema: GetTagQuestionsSchema, authorize: false });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { page = 1, pageSize = 10, query, tagId } = validationResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const tag = await Tag.findById(tagId);
    if (!tag) {
      throw new NotFoundError("Tag not found");
    }

    const filterQuery: QueryFilter<typeof Question> = {
      tags: {
        $in: [tagId],
      },
    };
    if (query) {
      filterQuery.title = { $regex: query, $options: "i" };
    }

    const totalQuestions = await Question.countDocuments(filterQuery);

    const questions = await Question.find(filterQuery)
      .select("_id title views answers upvotes downvotes author createdAt")
      .populate([
        { path: "author", select: "name image" },
        { path: "tags", select: "name" },
      ])
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + limit;

    return {
      success: true,
      data: {
        tag: JSON.parse(JSON.stringify(tag)) as Tag,
        questions: JSON.parse(JSON.stringify(questions)) as Question[],
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
