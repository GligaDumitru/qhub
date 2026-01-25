const ProfilePageId = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <div>
      <h1>ProfilePageId {id}</h1>
    </div>
  );
};

export default ProfilePageId;
