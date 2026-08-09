"use client";

import { globalSearch } from "@/lib/actions/general.action";
import { ReloadIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import GlobalFilter from "../filters/GlobalFilter";

const Separator = () => <div className="bg-light-700/50 dark:bg-dark-500/50 my-5 h-px" />;

const NoResultsFound = () => (
  <div className="flex-center flex-col px-5">
    <p className="text-5xl">🫣</p>
    <p className="text-dark200_light800 body-regular px-5 py-2.5">Oops, no results found</p>
  </div>
);

const Loading = () => (
  <div className="flex-center flex-col px-5">
    <ReloadIcon className="text-primary-500 my-2 h-10 w-10 animate-spin" />
    <p className="text-dark200_light800 body-regular">Browsing the whole database...</p>
  </div>
);

const getResultHref = (type: GlobalSearchedItem["type"], id: string) => {
  switch (type) {
    case "question":
    case "answer":
      return `/questions/${id}`;
    case "user":
      return `/profile/${id}`;
    case "tag":
      return `/tags/${id}`;
    default:
      return "/";
  }
};

const GlobalResultItem = ({ item, onSelect }: { item: GlobalSearchedItem; onSelect: (href: string) => void }) => {
  const href = getResultHref(item.type, item.id);

  const handleSelect = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onSelect(href);
  };

  return (
    <button
      type="button"
      onClick={handleSelect}
      className="hover:bg-light-700/50 dark:hover:bg-dark-500/50 flex w-full cursor-pointer items-start gap-3 px-5 py-2.5 text-left"
    >
      <Image src="/icons/tag.svg" alt="tags" width={18} height={18} className="invert-colors mt-1 object-contain" />
      <div>
        <p className="body-medium text-dark200_light800 line-clamp-1">{item.title}</p>
        <p className="text-light400_light500 small-medium mt-1 font-bold capitalize">{item.type}</p>
      </div>
    </button>
  );
};

const TopMatch = ({ onResultSelect }: { onResultSelect: (href: string) => void }) => {
  const searchParams = useSearchParams();

  const [results, setResults] = useState<GlobalSearchedItem[]>([]);
  const [isLoading, setLoading] = useState(true);

  const global = searchParams.get("global");
  const type = searchParams.get("type");

  useEffect(() => {
    const fetchResult = async () => {
      setResults([]);
      setLoading(true);

      try {
        const res = await globalSearch({
          query: global as string,
          type,
        });

        setResults(res.data ?? []);
      } catch (error) {
        console.log(error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (global) {
      fetchResult();
    }
  }, [global, type]);

  const hasResults = results.length > 0;
  return (
    <div className="space-y-5">
      <p className="text-dark400_light900 paragraph-semibold px-5">Top Match</p>
      {isLoading ? (
        <Loading />
      ) : !hasResults ? (
        <NoResultsFound />
      ) : (
        <>
          {results.map((result, index) => (
            <GlobalResultItem item={result} key={result.type + result.id + index} onSelect={onResultSelect} />
          ))}
        </>
      )}
    </div>
  );
};

const GlobalResult = ({ onResultSelect }: { onResultSelect: (href: string) => void }) => {
  return (
    <div className="bg-light-800 dark:bg-dark-400 absolute top-full z-10 mt-3 rounded-xl py-5 shadow-sm">
      <GlobalFilter />
      <Separator />
      <TopMatch onResultSelect={onResultSelect} />
    </div>
  );
};

export default GlobalResult;
