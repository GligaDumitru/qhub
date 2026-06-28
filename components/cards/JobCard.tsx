import Image from "next/image";
import Link from "next/link";

import {
  formatJobCategory,
  formatJobLocation,
  formatSalaryRange,
  getCountryFlagEmoji,
  getCountryFlagIcon,
} from "@/lib/job.utils";

import Metric from "../Metric";

interface Props {
  job: Job;
}

const JobCard = ({ job }: Props) => {
  const { employer_name, employer_logo, job_employment_type, job_title, job_description, job_apply_link, job_country } =
    job;

  const category = formatJobCategory(job);
  const location = formatJobLocation(job);
  const salaryRange = formatSalaryRange(job);
  const flagIcon = getCountryFlagIcon(job_country);

  return (
    <article className="background-light900_dark200 light-border shadow-light100_darknone flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-start sm:p-8">
      <div className="background-light800_dark400 flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[10px]">
        {employer_logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={employer_logo}
            alt={`${employer_name || "Company"} logo`}
            className="size-full object-contain p-2"
          />
        ) : (
          <Image src="/icons/job-search.svg" alt="company logo" width={32} height={32} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="h3-semibold text-dark300_light900">{job_title}</h3>
            <span className="subtle-medium background-light800_dark300 text-light500 rounded-md px-3 py-1 uppercase">
              {category}
            </span>
          </div>

          <div className="background-light800_dark400 flex w-fit shrink-0 items-center gap-2 rounded-md px-3 py-1.5">
            {flagIcon ? (
              <Image src={flagIcon} alt={`${job_country} flag`} width={16} height={16} className="rounded-full" />
            ) : (
              <span className="text-sm leading-none" aria-hidden="true">
                {getCountryFlagEmoji(job_country)}
              </span>
            )}
            <span className="small-regular text-dark400_light500">{location}</span>
          </div>
        </div>

        <p className="body-regular text-dark500_light700 line-clamp-2">{job_description}</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Metric
              imgUrl="/icons/clock-2.svg"
              alt="employment type"
              value={job_employment_type || "Full-time"}
              title=""
              textStyles="small-regular text-dark400_light500"
            />
            {salaryRange && (
              <Metric
                imgUrl="/icons/currency-dollar-circle.svg"
                alt="salary"
                value={salaryRange}
                title=""
                textStyles="small-regular text-dark400_light500"
              />
            )}
          </div>

          {job_apply_link && (
            <Link
              href={job_apply_link}
              target="_blank"
              rel="noopener noreferrer"
              className="body-semibold text-primary-500 flex shrink-0 items-center gap-1.5 self-start sm:self-auto"
            >
              View job
              <Image src="/icons/arrow-up-right.svg" alt="external link" width={14} height={14} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

export default JobCard;
