import TagCard from "@/components/cards/TagCard";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

describe("TagCard", () => {
  test("renders the full card with question count by default", () => {
    render(<TagCard _id="tag-1" name="react" questions={12} showCount />);

    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("12+")).toBeInTheDocument();
    expect(screen.getByText("Questions")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/tags/tag-1");
  });

  test("renders a compact link variant without the question count", () => {
    render(<TagCard _id="tag-1" name="react" questions={12} compact />);

    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.queryByText("Questions")).not.toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/tags/tag-1");
  });

  test("renders a compact button variant when isButton is set", () => {
    render(<TagCard _id="tag-1" name="react" compact isButton />);

    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("shows a remove icon and calls handleRemove when clicked", () => {
    const handleRemove = jest.fn();
    render(<TagCard _id="tag-1" name="react" compact remove handleRemove={handleRemove} />);

    fireEvent.click(screen.getByAltText("close icon"));
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });
});
