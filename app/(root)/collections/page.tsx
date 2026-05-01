import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import { getSavedQuestions } from "@/lib/actions/collection.action";

const CollectionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ query: string; filter: string; page: string; pageSize: string }>;
}) => {
  const { page = 1, pageSize = 10, query, filter } = await searchParams;

  const { success, data, error } = await getSavedQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const { collection = [] } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <section className="mt-11">
        <LocalSearch
          route={ROUTES.COLLECTIONS}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>
      <DataRenderer
        success={success}
        data={collection ?? []}
        error={error}
        empty={EMPTY_QUESTION}
        render={(collection) =>
          collection.map((item) => <QuestionCard key={item._id.toString()} question={item.question} />)
        }
      />
    </>
  );
};
export default CollectionsPage;
