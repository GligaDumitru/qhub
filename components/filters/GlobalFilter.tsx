"use client";
import { GlobalSearchFilters } from "@/constants/filters";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/url";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";

const GlobalFilter = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const typeParams = searchParams.get("type");

  const [active, setActive] = useState(typeParams || "");

  const handleTypeClick = (value: string) => {
    let newUrl = "";

    const isActiveSelected = active === value;

    if (isActiveSelected) {
      setActive("");

      newUrl = removeKeysFromQuery(searchParams.toString(), ["type"]);
    } else {
      setActive(value);

      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "type",
        value: value.toLowerCase(),
      });
    }

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex items-center gap-5 px-5">
      {/* <p className="text-dark400_light900 body-medium">Type:</p> */}
      <div className="flex gap-3">
        {GlobalSearchFilters.map((item) => (
          <Button
            key={item.value}
            className={`light-border-2 small-medium rounded-2xl px-5 py-2 capitalize ${
              active === item.value
                ? `bg-primary-500 text-light-900 hover:bg-primary-500 hover:opacity-80`
                : `bg-light-700 text-dark-400 hover:text-primary-500 hover:bg-light-700 dark:bg-dark-500 dark:text-light-800 dark:hover:text-primary-500`
            }`}
            onClick={() => handleTypeClick(item.value)}
          >
            {item.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default GlobalFilter;
