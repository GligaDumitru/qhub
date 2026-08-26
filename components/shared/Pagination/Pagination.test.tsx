import Pagination from "@/components/shared/Pagination";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("page=2"),
}));

// lib/url.ts imports the ESM-only `query-string` package, which Jest's
// default transform doesn't handle for node_modules; mock it to isolate
// Pagination's own logic instead of touching the global jest transform config.
jest.mock("@/lib/url", () => ({
  formUrlQuery: ({ key, value }: { key: string; value: string }) => `/questions?${key}=${value}`,
}));

describe("Pagination", () => {
  beforeEach(() => {
    push.mockClear();
  });

  test("renders the current page and disables Prev on page 1", () => {
    render(<Pagination page={1} isNext={true} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Prev").closest("button")).toBeDisabled();
    expect(screen.getByText("Next").closest("button")).not.toBeDisabled();
  });

  test("disables Next when isNext is false", () => {
    render(<Pagination page={2} isNext={false} />);
    expect(screen.getByText("Next").closest("button")).toBeDisabled();
  });

  test("navigates to page - 1 when Prev is clicked", () => {
    render(<Pagination page={2} isNext={true} />);
    fireEvent.click(screen.getByText("Prev"));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0][0]).toContain("page=1");
  });

  test("navigates to page + 1 when Next is clicked", () => {
    render(<Pagination page={2} isNext={true} />);
    fireEvent.click(screen.getByText("Next"));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push.mock.calls[0][0]).toContain("page=3");
  });
});
