import { auth } from "@/auth";
import AnswerCard from "@/components/cards/AnswerCard";
import QuestionCard from "@/components/cards/QuestionCard";
import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileLink from "@/components/user/ProfileLink";
import Stats from "@/components/user/Stats";
import UserAvatar from "@/components/UserAvatar";
import { EMPTY_ANSWERS, EMPTY_QUESTION, EMPTY_TAGS } from "@/constants/states";
import { getUser, getUserAnswers, getUserQuestions, getUserTags } from "@/lib/actions/user.action";
import dayjs from "dayjs";
import Link from "next/link";
import { notFound } from "next/navigation";

const Profile = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { pagePosts, pageAnswers, pageSize } = await searchParams;

  if (!id) notFound();

  const loggedInUser = await auth();
  const { success, data, error } = await getUser({
    userId: id,
  });

  if (!success)
    return (
      <div>
        <div className="h1-bold text-dark100_light900">{error?.message}</div>
      </div>
    );

  const { user, totalQuestions, totalAnswers } = data!;
  const {
    success: questionsSuccess,
    data: questionsData,
    error: questionsError,
  } = await getUserQuestions({
    userId: id,
    page: Number(pagePosts) || 1,
    pageSize: Number(pageSize) || 10,
  });
  const { questions = [], isNext } = questionsData || {};

  const {
    success: answersSuccess,
    data: answersData,
    error: answersError,
  } = await getUserAnswers({
    userId: id,
    page: Number(pageAnswers) || 1,
    pageSize: Number(pageSize) || 10,
  });

  const {
    success: tagsSuccess,
    data: tagsData,
    error: tagsError,
  } = await getUserTags({
    userId: id,
  });
  const { tags } = tagsData || {};
  const { answers = [], isNext: answersIsNext } = answersData || {};
  const { _id, name, image, portfolio, location, createdAt, username, bio } = user;

  return (
    <>
      <section className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <UserAvatar
            id={_id}
            name={name}
            imageUrl={image}
            className="size-[140px] rounded-full object-cover"
            fallbackClassName="text-6xl fond-bolder"
          />

          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">{name}</h2>
            <p className="paragraph-regular text-dark200_light800">@{username}</p>

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {portfolio && <ProfileLink imgUrl="/icons/link.svg" href={portfolio} title="Portfolio" />}
              {location && <ProfileLink imgUrl="/icons/location.svg" title="Portfolio" />}
              <ProfileLink imgUrl="/icons/calendar.svg" title={dayjs(createdAt).format("MMMM YYYY")} />
            </div>

            {bio && <p className="paragraph-regular text-dark400_light800 mt-8">{bio}</p>}
          </div>
        </div>

        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3">
          {loggedInUser?.user?.id === id && (
            <Link href="/profile/edit">
              <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-12 min-w-44 px-4 py-3">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </section>

      <Stats
        totalQuestions={totalQuestions}
        totalAnswers={totalAnswers}
        badges={{
          GOLD: 0,
          SILVER: 0,
          BRONZE: 0,
        }}
      />

      <section className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-2">
          <TabsList className="background-light800_dark400 min-h-[42px] p-1">
            <TabsTrigger value="top-posts" className="tab">
              Top Posts
            </TabsTrigger>
            <TabsTrigger value="newest" className="tab">
              Newest
            </TabsTrigger>
          </TabsList>
          <TabsContent value="top-posts" className="mt-5 flex w-full flex-col gap-6">
            <DataRenderer
              success={questionsSuccess}
              data={questions}
              error={questionsError}
              empty={EMPTY_QUESTION}
              render={(questions) =>
                questions.map((question) => <QuestionCard key={question._id.toString()} question={question} />)
              }
            />
            <Pagination page={Number(pagePosts) || 1} isNext={isNext || false} pageKey="pagePosts" />
          </TabsContent>
          <TabsContent value="newest" className="flex w-full flex-col gap-6">
            <DataRenderer
              success={answersSuccess}
              data={answers}
              error={answersError}
              empty={EMPTY_ANSWERS}
              render={(answers) =>
                answers.map((answer) => (
                  <AnswerCard
                    key={answer._id.toString()}
                    {...answer}
                    content={answer.content.slice(0, 100)}
                    containerClasses="card-wrapper rounded-[10px] px-7 py-9 sm:px-11"
                    showReadMore
                  />
                ))
              }
            />
            <Pagination page={Number(pageAnswers) || 1} isNext={answersIsNext || false} pageKey="pageAnswers" />
          </TabsContent>
        </Tabs>

        <div className="flex w-full min-w-[250px] flex-1 flex-col max-lg:hidden">
          <h3 className="h3-bold text-dark200_light900">Top Tags</h3>

          <div className="mt-7 flex flex-col gap-4">
            <DataRenderer
              success={tagsSuccess}
              data={tags}
              error={tagsError}
              empty={EMPTY_TAGS}
              render={(tags) => (
                <div className="mt-3 flex w-full flex-col gap-4">
                  {tags.map((tag) => (
                    <TagCard
                      key={tag._id.toString()}
                      _id={tag._id}
                      name={tag.name}
                      questions={tag.count}
                      showCount
                      compact
                    />
                  ))}
                </div>
              )}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Profile;
