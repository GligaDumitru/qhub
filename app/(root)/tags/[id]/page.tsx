import QuestionCard from "@/components/cards/QuestionCard";
import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import { getTagQuestions } from "@/lib/actions/tag.action";

const TagByIdPage = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize, query } = await searchParams;

  const { success, data, error } = await getTagQuestions({
    tagId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
  });

  const { tag, questions = [] } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        {tag && (
          <div className="flex items-center gap-2">
            <h1 className="h1-bold text-dark100_light900">{tag?.name}</h1>
            <TagCard key={tag._id} _id={tag._id} name={tag.name} compact />
          </div>
        )}
      </section>
      <section className="mt-11">
        <LocalSearch
          route={ROUTES.TAG(id)}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>
      <DataRenderer
        success={success}
        data={questions ?? []}
        error={error}
        empty={EMPTY_QUESTION}
        render={(questions) =>
          questions.map((question) => <QuestionCard key={question._id.toString()} question={question} />)
        }
      />
    </>
  );
};

export default TagByIdPage;
