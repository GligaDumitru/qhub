import UserAvatar from "@/components/user/UserAvatar";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("UserAvatar", () => {
  test("renders nothing when id is missing", () => {
    const { container } = render(<UserAvatar name="Jane Doe" />);
    expect(container).toBeEmptyDOMElement();
  });

  test("links to the user's profile", () => {
    render(<UserAvatar id="user-1" name="Jane Doe" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/profile/user-1");
  });

  test("derives initials from a two-word name", () => {
    render(<UserAvatar id="user-1" name="Jane Doe" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  test("caps initials at two characters for longer names", () => {
    render(<UserAvatar id="user-1" name="Jane Middle Doe" />);
    expect(screen.getByText("JM")).toBeInTheDocument();
  });

  test("handles a missing name without throwing", () => {
    render(<UserAvatar id="user-1" />);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });
});
