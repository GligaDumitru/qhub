"use server";

import { JobLocationFilters } from "@/constants/jobs";

export async function getCountries(): Promise<CountryFilter[]> {
  const apiKey = process.env.RC_LIVE_API_KEY;

  try {
    const response = await fetch("https://api.restcountries.com/countries/v5?fields=name&region=Europe&limit=100", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 86400, tags: ["countries"] },
    });

    if (!response.ok) {
      throw new Error(`REST Countries API error: ${response.status}`);
    }

    const countries = await response.json();
    const countriedData = countries?.data?.objects ?? [];

    const responseData = countriedData.map((c: Country) => ({
      name: c?.names?.common ?? "names",
      value: c?.names?.common ?? "name",
    }));
    return responseData;
  } catch (error) {
    console.error("Failed to fetch countries, using fallback:", error);
    return JobLocationFilters;
  }
}
