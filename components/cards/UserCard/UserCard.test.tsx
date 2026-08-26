import UserCard from "@/components/cards/UserCard";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("UserCard", () => {
  const user: User = {
    _id: "user-1",
    name: "Jane Doe",
    username: "janedoe",
    email: "jane@example.com",
    createdAt: new Date(),
  };

  test("renders the user's name and username", () => {
    render(<UserCard {...user} />);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("@janedoe")).toBeInTheDocument();
  });

  test("links to the user's profile", () => {
    render(<UserCard {...user} />);
    const profileLinks = screen.getAllByRole("link");
    expect(profileLinks.some((link) => link.getAttribute("href") === "/profile/user-1")).toBe(true);
  });
});
