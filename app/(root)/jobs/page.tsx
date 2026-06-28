import JobCard from "@/components/cards/JobCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_JOBS } from "@/constants/states";
import { getCountries } from "@/lib/actions/country.action";
import { getJobs } from "@/lib/actions/job.action";

const FindJobsPage = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams;

  const [jobsData, countriesData] = await Promise.all([
    getJobs({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      query: `${query}${filter ? `, ${filter}` : ""}`,
    }),
    getCountries(),
  ]);
  const { success, data, error } = jobsData;

  const { jobs = [], isNext } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Jobs</h1>
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col">
        <LocalSearch
          route={ROUTES.JOBS}
          imgSrc="/icons/search.svg"
          placeholder="Search by job title, company, or keywords..."
        />
        <CommonFilter
          leftIconSrc="/icons/carbon-location.svg"
          filters={countriesData}
          containerClasses="flex-1"
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </section>
      <DataRenderer
        success={success}
        data={jobs}
        error={error}
        empty={EMPTY_JOBS}
        render={(jobs) => (
          <>
            {jobs.map((job) => (
              <JobCard key={job.job_id} job={job} />
            ))}
          </>
        )}
      />
      <Pagination page={page} isNext={isNext || false} />
    </>
  );
};

export default FindJobsPage;
