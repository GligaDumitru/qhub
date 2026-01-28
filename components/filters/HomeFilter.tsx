"use client";

import { Button } from "@/components/ui/button";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/url";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const filters = [
  { name: "newest", value: "newest" },
  { name: "popular", value: "popular" },
  { name: "unanswered", value: "unanswered" },
  { name: "recommended", value: "recommended" },
];

const HomeFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get("filter") || "";

  const handleFilterClick = (filterValue: string) => {
    let newUrl = "";
    if (activeFilter === filterValue) {
      newUrl = removeKeysFromQuery(searchParams.toString(), ["filter"]);
    } else {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: filterValue,
      });
    }

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 sm:flex">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <Button
            key={filter.value}
            onClick={() => handleFilterClick(filter.value)}
            className={cn(
              `body-medium cursor-pointer rounded-lg px-6 py-3 capitalize shadow-none transition-colors`,
              isActive
                ? "bg-primary-100 text-primary-500 hover:bg-primary-100! dark:bg-dark-400! dark:text-primary-500! dark:hover:bg-dark-300!"
                : "bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-400"
            )}
          >
            {filter.name}
          </Button>
        );
      })}
    </div>
  );
};

export default HomeFilter;
