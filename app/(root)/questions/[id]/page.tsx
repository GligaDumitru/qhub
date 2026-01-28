const QuestionByIdPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <>
      <h1>Question {id}</h1>
    </>
  );
};

export default QuestionByIdPage;
