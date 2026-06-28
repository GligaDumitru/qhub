"use server";

import handleError from "../handlers/error";

const JOBS_PER_PAGE = 10;

export async function getJobs(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    jobs: Job[];
    isNext: boolean;
  }>
> {
  const apiKey = process.env.RAPIDAPI_KEY;
  const { query = "Full Stack Developer", page = 1 } = params;

  if (!apiKey) {
    return handleError(new Error("RAPIDAPI_KEY is not configured")) as ErrorResponse;
  }

  try {
    const searchParams = new URLSearchParams({
      query: query || "Full Stack Developer",
      page: String(page),
    });

    const response = await fetch(`https://jsearch.p.rapidapi.com/search-v2?${searchParams.toString()}`, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(`JSearch API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    const jobs = data?.data?.jobs || [];

    return {
      success: true,
      data: {
        jobs,
        isNext: jobs.length >= JOBS_PER_PAGE,
      },
    };
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return handleError(error) as ErrorResponse;
  }
}
