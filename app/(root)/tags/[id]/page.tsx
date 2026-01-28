const TagByIdPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <>
      <h1>Tag {id}</h1>
    </>
  );
};

export default TagByIdPage;
