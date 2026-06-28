const COUNTRY_FLAG_ICONS: Record<string, string> = {
  AU: "/icons/au.svg",
};

export const formatJobCategory = (job: Job): string => {
  const industry = job.industry?.trim();
  if (industry) {
    const primaryWord = industry.split(/[\s,/]+/)[0];
    return primaryWord.toUpperCase();
  }

  if (job.job_function && job.job_function !== "other") {
    return job.job_function.replace(/_/g, " ").toUpperCase();
  }

  return "GENERAL";
};

export const formatJobLocation = (job: Job): string => {
  if (job.job_city && job.job_country) {
    return `${job.job_city}, ${job.job_country}`;
  }

  return job.job_location || "Remote";
};

const formatSalaryValue = (value: number): string => {
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }

  return String(value);
};

export const formatSalaryRange = (job: Job): string | null => {
  const { job_min_salary, job_max_salary, job_salary } = job;

  if (job_min_salary && job_max_salary) {
    return `${formatSalaryValue(job_min_salary)} - ${formatSalaryValue(job_max_salary)}`;
  }

  if (job_salary) {
    return formatSalaryValue(job_salary);
  }

  return null;
};

export const getCountryFlagIcon = (countryCode?: string): string | null => {
  if (!countryCode) return null;
  return COUNTRY_FLAG_ICONS[countryCode.toUpperCase()] || null;
};

export const getCountryFlagEmoji = (countryCode?: string): string => {
  if (!countryCode || countryCode.length !== 2) return "🌍";

  const code = countryCode.toUpperCase();
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)));
};
