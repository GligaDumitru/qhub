"use client";
import { formUrlQuery } from "@/lib/url";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface Filter {
  name: string;
  value: string;
}

interface CommonFilterProps {
  filters: Filter[];
  otherClasses?: string;
  containerClasses?: string;
  placeholder?: string;
  leftIconSrc?: string;
}

const CommonFilter = ({
  filters,
  otherClasses,
  containerClasses,
  placeholder = "Select a filter",
  leftIconSrc,
}: CommonFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilter = searchParams.get("filter");
  const handleFilterChange = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "filter",
      value: value,
    });
    router.push(newUrl, { scroll: false });
  };
  const alignItemWithTrigger = false;
  return (
    <div
      className={cn("background-light800_darkgradient text-dark400_light500 relative rounded-[10px]", containerClasses)}
    >
      <Select onValueChange={handleFilterChange} defaultValue={activeFilter || undefined}>
        <SelectTrigger
          className={cn(
            "body-regular no-focus light-border text-dark400_light500 w-full rounded-[10px] border bg-transparent! px-5 py-2.5",
            otherClasses,
            leftIconSrc && "pl-4"
          )}
          aria-label="Select a filter"
        >
          {leftIconSrc && <Image src={leftIconSrc} alt="location" width={24} height={24} />}
          <div className="line-clamp-1 flex flex-1 items-center gap-2 text-left">
            <SelectValue placeholder={placeholder} className="text-dark400_light500" />
          </div>
        </SelectTrigger>
        <SelectContent position={alignItemWithTrigger ? "item-aligned" : "popper"}>
          <SelectGroup>
            {filters.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CommonFilter;
