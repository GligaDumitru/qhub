"use client";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/url";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";

interface LocalSearchProps {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearch = ({ route, imgSrc, placeholder, otherClasses }: LocalSearchProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [searchQuery, setSearchQuery] = useState(query);

  const previousSearchRef = useRef(searchQuery);

  useEffect(() => {
    // Only trigger if searchQuery actually changed
    if (previousSearchRef.current === searchQuery) return;
    previousSearchRef.current = searchQuery;

    const debounceSearchFn = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });
        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === route) {
          const newUrl = removeKeysFromQuery(searchParams.toString(), ["query"]);
          router.push(newUrl, { scroll: false });
        }
      }
    }, 1000);

    return () => clearTimeout(debounceSearchFn);
  }, [pathname, route, router, searchParams, searchQuery]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      <Image src={imgSrc} alt="search" width={24} height={24} className="cursor-pointer" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="paragraph-regular text-dark400_light700 no-focus placeholder min-h-[56px] grow items-center gap-1 rounded-xl border-none bg-transparent! px-4 shadow-none outline-none"
      />
    </div>
  );
};

export default LocalSearch;
