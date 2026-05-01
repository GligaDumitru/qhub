import { AnswerFilters } from "@/constants/filters";
import { EMPTY_ANSWERS } from "@/constants/states";
import DataRenderer from "../DataRenderer";
import AnswerCard from "../cards/AnswerCard";
import CommonFilter from "../filters/CommonFilter";

interface AllAnswersProps extends ActionResponse<Answer[]> {
  totalAnswers: number;
}

const AllAnswers = ({ success, data, error, totalAnswers }: AllAnswersProps) => {
  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="h3-bold text-dark200_light900">
          {totalAnswers} {totalAnswers === 1 ? "Answer" : "Answers"}
        </h3>
        <CommonFilter filters={AnswerFilters} otherClasses="sm:min-w-32" containerClasses="max-xs:w-full" />
      </div>
      <DataRenderer
        success={success}
        data={data ?? []}
        error={error}
        empty={EMPTY_ANSWERS}
        render={(answers) => answers.map((answer) => <AnswerCard key={answer._id} {...answer} />)}
      />
    </div>
  );
};

export default AllAnswers;
