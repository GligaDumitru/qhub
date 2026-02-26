import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import { getQuestions } from "@/lib/actions/question.action";
import Link from "next/link";

const InfoMessage = ({ message }: { message: string }) => {
  return (
    <div className="mt-10 flex w-full items-center justify-center">
      <p className="text-dark400_light700">{message}</p>
    </div>
  );
};

const Home = async ({
  searchParams,
}: {
  searchParams: Promise<{ query: string; filter: string; page: string; pageSize: string }>;
}) => {
  const { page = 1, pageSize = 10, query, filter } = await searchParams;

  const { success, data, error } = await getQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  });

  const { questions = [] } = data || {};

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Button className="primary-gradient text-light-900 min-h-[46px] px-4 py-3" asChild>
          <Link href={ROUTES.ASK_QUESTION}> Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch route="/" imgSrc="/icons/search.svg" placeholder="Search questions..." otherClasses="flex-1" />
      </section>
      <HomeFilter />
      <div className="mt-10 flex w-full flex-col gap-6">
        {success ? (
          <>
            {(questions ?? []).map((question: Question) => (
              <QuestionCard key={question._id.toString()} question={question} />
            ))}
            {questions.length === 0 && <InfoMessage message="No questions found" />}
          </>
        ) : (
          <InfoMessage message={error?.message || "An error occurred while fetching questions"} />
        )}
      </div>
    </>
  );
};
export default Home;
