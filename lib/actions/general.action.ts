"use server";

import { Answer, Question, Tag, User } from "@/database";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-errors";
import { GlobalSearchSchema } from "../validations";

const modelsAndTypes = [
  { model: Question, searchField: "title", type: "question" },
  { model: User, searchField: "name", type: "user" },
  { model: Answer, searchField: "content", type: "answer" },
  { model: Tag, searchField: "name", type: "tag" },
];

const searchableTypes = modelsAndTypes.map((item) => item.type);

export async function globalSearch(params: GlobalSearchParams): Promise<ActionResponse<GlobalSearchedItem[]>> {
  const validationResult = await action({
    params,
    schema: GlobalSearchSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { query, type } = params;
  const regexQuery = {
    $regex: query,
    $options: "i",
  };

  try {
    // search for specific type
    if (type && searchableTypes.includes(type.toLowerCase())) {
      const modelSelected = modelsAndTypes.find((item) => item.type === type);
      if (!modelSelected) {
        throw new NotFoundError("Not found type");
      }

      const { model, searchField } = modelSelected;

      const queryResults = await model
        .find({
          [searchField]: regexQuery,
        })
        .limit(8);

      const results = queryResults.map((item) => ({
        title: type === "answer" ? `Answers containing ${query}` : item[searchField],
        type,
        id: type === "answer" ? item.question : item._id,
      }));

      return {
        success: true,
        data: JSON.parse(JSON.stringify(results)),
      };
    }

    // search for all types
    const results = [];

    for (const { model, searchField, type } of modelsAndTypes) {
      const queryResults = await model
        .find({
          [searchField]: regexQuery,
        })
        .limit(2);

      results.push(
        ...queryResults.map((item) => ({
          title: type === "answer" ? `Answers containing ${query}` : item[searchField],
          type,
          id: type === "answer" ? item.question : item._id,
        }))
      );
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(results)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
