import ROUTES from "@/constants/routes";
import { getHotQuestions } from "@/lib/actions/question.action";
import { getTopTags } from "@/lib/actions/tag.action";
import Image from "next/image";
import Link from "next/link";
import TagCard from "../cards/TagCard";
import DataRenderer from "../DataRenderer";

const RightSidebar = async () => {
  const [
    { success: hotQuestionsSuccess, data: hotQuestionsData, error: hotQuestionsError },
    { success: popularTagsSuccess, data: popularTagsData, error: popularTagsError },
  ] = await Promise.all([getHotQuestions(), getTopTags()]);

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 right-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <DataRenderer
          success={hotQuestionsSuccess}
          data={hotQuestionsData}
          error={hotQuestionsError}
          empty={{
            title: "No questions found",
            message: "No questions have been asked yet.",
          }}
          render={(questions) => (
            <div className="mt-7 flex w-full flex-col gap-[30px]">
              {questions.map((question) => (
                <Link
                  key={question._id}
                  href={ROUTES.QUESTION(question._id)}
                  className="flex cursor-pointer items-center justify-between gap-7"
                >
                  <p className="body-medium text-dark500_light700 line-clamp-2">{question.title}</p>

                  <Image
                    src="/icons/chevron-right.svg"
                    alt="Chevron"
                    width={20}
                    height={20}
                    className="invert-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        />
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <DataRenderer
          success={popularTagsSuccess}
          data={popularTagsData}
          error={popularTagsError}
          empty={{
            title: "No tags found",
            message: "No tags have been created yet.",
          }}
          render={(popularTags) => (
            <div className="mt-7 flex flex-col gap-4">
              {popularTags.map(({ _id, name, questions }) => (
                <TagCard key={_id} _id={_id} name={name} questions={questions} showCount compact />
              ))}
            </div>
          )}
        />
      </div>
    </section>
  );
};

export default RightSidebar;
