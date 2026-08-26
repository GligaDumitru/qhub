"use client";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/url";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import GlobalResult from "@/components/search/GlobalResult";

const GLOBAL_PARAM_KEY = "global";
const TYPE_PARAM_KEY = "type";

const GlobalSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get(GLOBAL_PARAM_KEY);

  const [search, setSearch] = useState(query || "");
  const [isOpen, setIsOpen] = useState(Boolean(query));

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(isOpen);
  const isSelectingResultRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const clearSearchParams = useCallback(() => {
    if (!searchParams.get(GLOBAL_PARAM_KEY)) return;

    const newUrl = removeKeysFromQuery(searchParams.toString(), [GLOBAL_PARAM_KEY, TYPE_PARAM_KEY]);
    router.push(newUrl, { scroll: false });
  }, [router, searchParams]);

  const dismissSearch = useCallback(() => {
    setIsOpen(false);
    setSearch("");
    clearSearchParams();
  }, [clearSearchParams]);

  const handleResultSelect = useCallback(
    (href: string) => {
      isSelectingResultRef.current = true;
      setSearch("");
      setIsOpen(false);
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSelectingResultRef.current) {
        isSelectingResultRef.current = false;
        return;
      }

      if (!isOpenRef.current) return;

      if (
        searchContainerRef.current &&
        event.target instanceof Node &&
        !searchContainerRef.current.contains(event.target)
      ) {
        dismissSearch();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dismissSearch]);

  useEffect(() => {
    if (!isOpen || !search) return;

    const delayDebounceTimeout = setTimeout(() => {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: GLOBAL_PARAM_KEY,
        value: search,
      });
      router.push(newUrl, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceTimeout);
  }, [search, isOpen, router, searchParams]);

  return (
    <div className="relative mx-10 w-full max-w-150" ref={searchContainerRef}>
      <div className="background-light800_darkgradient relative flex min-h-14 grow items-center gap-1 rounded-xl px-4">
        <Image src="/icons/search.svg" alt="search" width={24} height={24} className="cursor-pointer" />
        <Input
          type="text"
          placeholder="Search anything globally"
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);

            if (value) {
              if (!isOpen) setIsOpen(true);
              return;
            }

            if (isOpen) dismissSearch();
          }}
        />
      </div>
      {isOpen && <GlobalResult onResultSelect={handleResultSelect} />}
    </div>
  );
};

export default GlobalSearch;
