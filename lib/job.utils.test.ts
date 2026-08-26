import {
  formatJobCategory,
  formatJobLocation,
  formatSalaryRange,
  getCountryFlagEmoji,
  getCountryFlagIcon,
} from "@/lib/job.utils";

describe("formatJobCategory", () => {
  test("uses the first word of industry, uppercased, when present", () => {
    expect(formatJobCategory({ industry: "Information Technology" } as Job)).toBe("INFORMATION");
  });

  test("splits on commas and slashes too", () => {
    expect(formatJobCategory({ industry: "Tech, Software" } as Job)).toBe("TECH");
  });

  test("falls back to job_function when industry is absent", () => {
    expect(formatJobCategory({ job_function: "software_development" } as Job)).toBe("SOFTWARE DEVELOPMENT");
  });

  test("falls back to GENERAL when job_function is 'other' or missing", () => {
    expect(formatJobCategory({ job_function: "other" } as Job)).toBe("GENERAL");
    expect(formatJobCategory({} as Job)).toBe("GENERAL");
  });
});

describe("formatJobLocation", () => {
  test("combines city and country when both are present", () => {
    expect(formatJobLocation({ job_city: "Berlin", job_country: "DE" } as Job)).toBe("Berlin, DE");
  });

  test("falls back to job_location when city/country are missing", () => {
    expect(formatJobLocation({ job_location: "Remote (EU)" } as Job)).toBe("Remote (EU)");
  });

  test("falls back to 'Remote' when nothing is available", () => {
    expect(formatJobLocation({} as Job)).toBe("Remote");
  });
});

describe("formatSalaryRange", () => {
  test("formats a min/max range, abbreviating thousands", () => {
    expect(formatSalaryRange({ job_min_salary: 80000, job_max_salary: 120000 } as Job)).toBe("80k - 120k");
  });

  test("formats a single salary value", () => {
    expect(formatSalaryRange({ job_salary: 95000 } as Job)).toBe("95k");
  });

  test("does not abbreviate values under 1000", () => {
    expect(formatSalaryRange({ job_salary: 500 } as Job)).toBe("500");
  });

  test("returns null when no salary data is available", () => {
    expect(formatSalaryRange({} as Job)).toBeNull();
  });
});

describe("getCountryFlagIcon", () => {
  test("returns the icon path for a known country code", () => {
    expect(getCountryFlagIcon("AU")).toBe("/icons/au.svg");
    expect(getCountryFlagIcon("au")).toBe("/icons/au.svg");
  });

  test("returns null for an unknown code or when omitted", () => {
    expect(getCountryFlagIcon("US")).toBeNull();
    expect(getCountryFlagIcon(undefined)).toBeNull();
  });
});

describe("getCountryFlagEmoji", () => {
  test("builds a regional indicator emoji from a 2-letter code", () => {
    expect(getCountryFlagEmoji("US")).toBe("🇺🇸");
  });

  test("falls back to a globe emoji for an invalid code", () => {
    expect(getCountryFlagEmoji("USA")).toBe("🌍");
    expect(getCountryFlagEmoji(undefined)).toBe("🌍");
  });
});
