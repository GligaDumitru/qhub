import JobCard from "@/components/cards/JobCard";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("JobCard", () => {
  const job: Job = {
    employer_name: "Acme Corp",
    employer_logo: "https://example.com/logo.png",
    job_employment_type: "Full-time",
    job_title: "Senior Frontend Engineer",
    job_description: "Build great UIs.",
    job_apply_link: "https://example.com/apply",
    job_city: "Berlin",
    job_country: "DE",
    job_min_salary: 80000,
    job_max_salary: 120000,
    industry: "Technology",
  };

  test("renders title, category, location, and salary", () => {
    render(<JobCard job={job} />);

    expect(screen.getByText("Senior Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("TECHNOLOGY")).toBeInTheDocument();
    expect(screen.getByText("Berlin, DE")).toBeInTheDocument();
    expect(screen.getByText("80k - 120k")).toBeInTheDocument();
  });

  test("renders an apply link when job_apply_link is present", () => {
    render(<JobCard job={job} />);
    expect(screen.getByText("View job").closest("a")).toHaveAttribute("href", "https://example.com/apply");
  });

  test("omits the apply link and salary metric when data is missing", () => {
    const minimalJob: Job = { job_title: "Support Engineer", job_description: "Help customers." };
    render(<JobCard job={minimalJob} />);

    expect(screen.queryByText("View job")).not.toBeInTheDocument();
    expect(screen.getByText("Support Engineer")).toBeInTheDocument();
    expect(screen.getByText("GENERAL")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
  });
});
