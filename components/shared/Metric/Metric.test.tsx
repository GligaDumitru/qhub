import Metric from "@/components/shared/Metric";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("Metric", () => {
  test("renders the value and title", () => {
    render(<Metric imgUrl="/icons/like.svg" alt="like" value={5} title="Votes" textStyles="text-sm" />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Votes")).toBeInTheDocument();
    expect(screen.getByAltText("like")).toBeInTheDocument();
  });

  test("renders without a title span when title is empty", () => {
    render(<Metric imgUrl="/icons/like.svg" alt="like" value={5} title="" textStyles="text-sm" />);
    expect(screen.queryByText("Votes")).not.toBeInTheDocument();
  });

  test("wraps content in a link when href is provided", () => {
    render(
      <Metric imgUrl="/icons/avatar.svg" alt="author" value="Jane" title="" textStyles="text-sm" href="/profile/1" />
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/profile/1");
  });

  test("does not render a link when href is omitted", () => {
    render(<Metric imgUrl="/icons/avatar.svg" alt="author" value="Jane" title="" textStyles="text-sm" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
