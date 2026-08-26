import QuestionCard from "@/components/cards/QuestionCard";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// EditDeleteAction pulls in server actions (deleteQuestion/deleteAnswer) and
// next/navigation; mock it to keep this a component-only test.
jest.mock("@/components/user/EditDeleteAction", () => ({
  __esModule: true,
  default: ({ type }: { type: string }) => <div data-testid="edit-delete-action">{type}</div>,
}));

describe("QuestionCard", () => {
  const question: Question = {
    _id: "question-1",
    title: "How do I use Zod?",
    content: "I want to validate form input with Zod, what's the best approach?",
    tags: [{ _id: "tag-1", name: "zod" }],
    author: { _id: "user-1", name: "Jane Doe", image: "/avatar.png" },
    createdAt: new Date().toISOString(),
    upvotes: 3,
    downvotes: 0,
    answers: 2,
    views: 42,
  };

  test("renders the title, tags, and metrics", () => {
    render(<QuestionCard question={question} />);

    expect(screen.getByText("How do I use Zod?")).toBeInTheDocument();
    expect(screen.getByText("zod")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // upvotes
    expect(screen.getByText("2")).toBeInTheDocument(); // answers
    expect(screen.getByText("42")).toBeInTheDocument(); // views
  });

  test("links the title to the question page", () => {
    render(<QuestionCard question={question} />);
    expect(screen.getByText("How do I use Zod?").closest("a")).toHaveAttribute("href", "/questions/question-1");
  });

  test("does not render action buttons by default", () => {
    render(<QuestionCard question={question} />);
    expect(screen.queryByTestId("edit-delete-action")).not.toBeInTheDocument();
  });

  test("renders action buttons when showActionBtns is true", () => {
    render(<QuestionCard question={question} showActionBtns />);
    expect(screen.getByTestId("edit-delete-action")).toHaveTextContent("Question");
  });
});
