import AnswerCard from "@/components/cards/AnswerCard";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// hasVoted is a server action (auth() + Mongoose) — out of scope for this
// component-only pass; mock it so AnswerCard never invokes real DB/auth code.
jest.mock("@/lib/actions/vote.action", () => ({
  hasVoted: jest.fn().mockResolvedValue({ success: true, data: { hasUpvoted: false, hasDownvoted: false } }),
}));

// Preview uses next-mdx-remote/rsc, an RSC-only async component that can't
// render synchronously via @testing-library/react; mock it to a plain span.
jest.mock("@/components/editor/Preview", () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => <div data-testid="preview">{content}</div>,
}));

// Votes uses next-auth's useSession and a server action; mock it as an
// opaque child so this test only asserts AnswerCard's own rendering.
jest.mock("@/components/votes/Votes", () => ({
  __esModule: true,
  default: () => <div data-testid="votes" />,
}));

jest.mock("@/components/user/EditDeleteAction", () => ({
  __esModule: true,
  default: ({ type }: { type: string }) => <div data-testid="edit-delete-action">{type}</div>,
}));

describe("AnswerCard", () => {
  const answer: Answer = {
    _id: "answer-1",
    author: { _id: "user-1", name: "Jane Doe", image: "/avatar.png" },
    content: "You should use Zod for schema validation.",
    upvotes: 2,
    downvotes: 0,
    question: "question-1",
    createdAt: new Date().toISOString(),
  };

  test("renders the author name and answer content via Preview", () => {
    render(<AnswerCard {...answer} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByTestId("preview")).toHaveTextContent("You should use Zod for schema validation.");
  });

  test("links the author name to their profile", () => {
    render(<AnswerCard {...answer} />);
    expect(screen.getByText("Jane Doe").closest("a")).toHaveAttribute("href", "/profile/user-1");
  });

  test("does not render action buttons or the read-more link by default", () => {
    render(<AnswerCard {...answer} />);
    expect(screen.queryByTestId("edit-delete-action")).not.toBeInTheDocument();
    expect(screen.queryByText("Read more...")).not.toBeInTheDocument();
  });

  test("renders action buttons and a read-more link when requested", () => {
    render(<AnswerCard {...answer} showActionBtns showReadMore />);

    expect(screen.getByTestId("edit-delete-action")).toHaveTextContent("Answer");
    expect(screen.getByText("Read more...").closest("a")).toHaveAttribute(
      "href",
      "/questions/question-1#answer-answer-1"
    );
  });
});
