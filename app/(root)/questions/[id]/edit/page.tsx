import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import ROUTES from "@/constants/routes";
import { getQuestion } from "@/lib/actions/question.action";
import { notFound, redirect } from "next/navigation";

const EditQuestionPage = async ({ params }: RouteParams) => {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(ROUTES.SIGN_IN);
  }

  const { data: question, success } = await getQuestion({ questionId: id as string });
  if (!success) {
    return notFound();
  }

  if (question?.author.toString() !== session?.user?.id) {
    redirect(ROUTES.QUESTION(id as string));
  }

  return (
    <main>
      <QuestionForm question={question as unknown as Question} isEdit={true} />
    </main>
  );
};

export default EditQuestionPage;
