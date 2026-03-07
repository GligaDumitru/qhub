import TagCard from "@/components/cards/TagCard";
import Preview from "@/components/editor/Preview";
import Metric from "@/components/Metric";
import UserAvatar from "@/components/UserAvatar";
import ROUTES from "@/constants/routes";
import { getQuestion, incrementQuestionView } from "@/lib/actions/question.action";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";

const QuestionDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  const { success, data } = await getQuestion({ questionId: id as string });
  if (!success || !data) {
    return notFound();
  }

  after(async () => {
    await incrementQuestionView({ questionId: id as string });
  });

  const { author, tags, title, createdAt, answers, views, content } = data;
  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id.toString()}
              name={author.name}
              className="size-[22px]"
              fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">{author.name}</p>
            </Link>
          </div>
          <div className="flex justify-end">
            <p>Votes</p>
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">{title}</h2>
      </div>
      <div className="mt-5 mb-8 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(createdAt)}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <Preview content={content} />

      <div className="flex-wrape mt-8 flex gap-2">
        {tags.map((tag) => (
          <TagCard key={tag._id} _id={tag._id} name={tag.name} compact />
        ))}
      </div>
    </>
  );
};

export default QuestionDetails;
