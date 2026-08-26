import DataRenderer from "@/components/shared/DataRenderer";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("DataRenderer", () => {
  test("renders the error state when success is false", () => {
    render(
      <DataRenderer<string[]> success={false} error={{ message: "Something broke" }} data={[]} render={() => null} />
    );

    expect(screen.getByText("Something broke")).toBeInTheDocument();
  });

  test("renders the default error title/message when no error is provided", () => {
    render(<DataRenderer<string[]> success={false} data={[]} render={() => null} />);

    expect(screen.getByText("Something Went Wrong")).toBeInTheDocument();
  });

  test("renders the empty state when data is missing or an empty array", () => {
    render(
      <DataRenderer<string[]>
        success={true}
        data={[]}
        empty={{ title: "No results", message: "Try a different search" }}
        render={() => null}
      />
    );

    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.getByText("Try a different search")).toBeInTheDocument();
  });

  test("calls render with the data and displays its output when data is present", () => {
    const items = ["one", "two"];
    render(<DataRenderer<string[]> success={true} data={items} render={(data) => <span>{data.join(",")}</span>} />);

    expect(screen.getByText("one,two")).toBeInTheDocument();
  });
});
