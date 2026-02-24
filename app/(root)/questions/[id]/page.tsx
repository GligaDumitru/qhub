const QuestionDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  return (
    <>
      <h1>Question {id}</h1>
    </>
  );
};

export default QuestionDetails;
