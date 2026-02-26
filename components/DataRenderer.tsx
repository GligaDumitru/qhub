import { DEFAULT_EMPTY, DEFAULT_ERROR } from "@/constants/states";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

interface Props<T> {
  success: boolean;
  data?: T | null;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  empty?: {
    title: string;
    message: string;
    button?: { text: string; href: string };
  };
  render: (data: T) => React.ReactNode;
}

interface StateSkeletonProps {
  image: {
    light: string;
    dark: string;
    alt: string;
  };
  title: string;
  message: string;
  button?: { text: string; href: string };
}

const StateSkeleton = ({ image, title, message, button }: StateSkeletonProps) => {
  return (
    <div className="mt-16 flex flex-col items-center justify-center gap-4">
      <>
        <Image src={image.dark} alt={image.alt} width={270} height={200} className="hidden object-contain dark:block" />
        <Image src={image.light} alt={image.alt} width={270} height={200} className="object-contain dark:hidden" />
      </>

      <h2 className="h2-bold text-dark200_light900 mt-8">{title}</h2>
      <p className="body-regular text-dark500_light700 my-3.5 max-w-md text-center">{message}</p>
      {button && (
        <Link href={button.href}>
          <Button className="paragraph-medium text-light-900 bg-primary-500 hover:bg-primary-500/90 mt-5 min-h-[46px] cursor-pointer rounded-lg px-4 py-3">
            {button.text}
          </Button>
        </Link>
      )}
    </div>
  );
};

const DataRenderer = <T,>({ success, data, error, empty = DEFAULT_EMPTY, render }: Props<T>) => {
  if (!success) {
    return (
      <StateSkeleton
        image={{
          light: "/images/light-error.png",
          dark: "/images/dark-error.png",
          alt: "Failed to load data",
        }}
        title={error?.message || DEFAULT_ERROR.title}
        message={error?.details ? JSON.stringify(error.details, null, 2) : DEFAULT_ERROR.message}
        button={DEFAULT_ERROR.button}
      />
    );
  }

  if (!data || (data as T[]).length === 0) {
    return (
      <StateSkeleton
        image={{
          light: "/images/light-empty.png",
          dark: "/images/dark-empty.png",
          alt: "Empty",
        }}
        title={empty.title}
        message={empty.message}
        button={empty.button}
      />
    );
  }

  if (success) {
    return <div className="mt-10 flex w-full flex-col gap-6">{render(data)}</div>;
  }
};

export default DataRenderer;
