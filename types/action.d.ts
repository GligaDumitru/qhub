interface SignInWithOAuthProps {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    name: string;
    username: string;
    email: string;
    image?: string;
  };
}

interface AuthCredentials {
  name: string;
  email: string;
  password: string;
  username: string;
}

interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
}

interface EditQuestionParams extends CreateQuestionParams {
  questionId: string;
}

interface GetQuestionParams {
  questionId: string;
}

interface GetTagQuestionsParams extends Omit<PaginatedSearchParams, "filter"> {
  tagId: string;
}

interface IncrementQuestionViewParams {
  questionId: string;
}

interface CreateAnswerParams {
  content: string;
  questionId: string;
}

interface GetAnswersParams extends PaginatedSearchParams {
  questionId: string;
}
