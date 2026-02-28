import { getTags } from "@/lib/actions/tag.action";

const TagsPage = async () => {
  const { success, data, error } = await getTags({
    page: 1,
    pageSize: 10,
    query: "",
    sort: "popular",
  });

  const { tags = [] } = data || {};
  console.log("tags", JSON.stringify(tags, null, 2));

  return (
    <>
      <h1>Tags</h1>
      <div>
        {tags.map((tag) => (
          <div key={tag._id}>{tag.name}</div>
        ))}
      </div>
    </>
  );
};

export default TagsPage;
