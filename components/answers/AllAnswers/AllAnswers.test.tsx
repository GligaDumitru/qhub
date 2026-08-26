import AllAnswers from "@/components/answers/AllAnswers";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// Mock child components to isolate `AllAnswers` behaviour
jest.mock("@/components/cards/AnswerCard", () => ({
  __esModule: true,
  default: (props: { _id?: string }) => <div data-testid="answer-card">{props._id}</div>,
}));

jest.mock("@/components/shared/DataRenderer", () => ({
  __esModule: true,
  default: ({ data, render }: { data?: unknown; render?: (d: unknown) => React.ReactNode }) => (
    <div data-testid="data-renderer">{render?.(data)}</div>
  ),
}));

jest.mock("@/components/filters/CommonFilter", () => ({
  __esModule: true,
  default: ({ filters }: { filters?: unknown }) => <div data-testid="common-filter">{JSON.stringify(filters)}</div>,
}));

jest.mock("@/components/shared/Pagination", () => ({
  __esModule: true,
  default: ({ page, isNext }: { page: number; isNext: boolean }) => (
    <div data-testid="pagination">
      page:{page}-next:{String(isNext)}
    </div>
  ),
}));

describe("AllAnswers component", () => {
  test("renders empty state when no answers", () => {
    render(<AllAnswers success={true} data={undefined} error={undefined} totalAnswers={0} page={1} isNext={false} />);

    expect(screen.getByTestId("data-renderer")).toBeInTheDocument();
    // no AnswerCard rendered
    expect(screen.queryAllByTestId("answer-card").length).toBe(0);
    expect(screen.getByTestId("pagination")).toHaveTextContent("page:1-next:false");
  });

  test("renders single answer and singular title", () => {
    const answer: Answer = {
      _id: "a1",
      author: { _id: "u1", name: "User 1", image: "" },
      content: "An answer",
      upvotes: 0,
      downvotes: 0,
      question: "q1",
      createdAt: new Date().toISOString(),
    };

    render(<AllAnswers success={true} data={[answer]} error={undefined} totalAnswers={1} page={1} isNext={false} />);

    expect(screen.getByText("1 Answer")).toBeInTheDocument();
    const cards = screen.getAllByTestId("answer-card");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("a1");
  });

  test("renders multiple answers and plural title", () => {
    const answers: Answer[] = [
      {
        _id: "a1",
        author: { _id: "u1", name: "User 1", image: "" },
        content: "Answer 1",
        upvotes: 0,
        downvotes: 0,
        question: "q1",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "a2",
        author: { _id: "u2", name: "User 2", image: "" },
        content: "Answer 2",
        upvotes: 0,
        downvotes: 0,
        question: "q1",
        createdAt: new Date().toISOString(),
      },
    ];

    render(<AllAnswers success={true} data={answers} error={undefined} totalAnswers={2} page={2} isNext={true} />);

    expect(screen.getByText("2 Answers")).toBeInTheDocument();
    const cards = screen.getAllByTestId("answer-card");
    expect(cards).toHaveLength(2);
    expect(screen.getByTestId("pagination")).toHaveTextContent("page:2-next:true");
  });
});
