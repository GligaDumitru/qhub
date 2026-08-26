import {
  AccountSchema,
  AskQuestionSchema,
  CreateInteractionSchema,
  CreateVoteSchema,
  EditQuestionSchema,
  GetTagQuestionsSchema,
  GlobalSearchSchema,
  objectIdSchema,
  PaginatedSearchParamsSchema,
  SignInSchema,
  SignInWithOAuthSchema,
  SignUpSchema,
  UpdateUserSchema,
  UpdateVoteCountSchema,
  UserSchema,
} from "@/lib/validations";

describe("objectIdSchema", () => {
  test("accepts a 24-char hex string", () => {
    expect(objectIdSchema.safeParse("507f1f77bcf86cd799439011").success).toBe(true);
  });

  test("rejects an empty string", () => {
    expect(objectIdSchema.safeParse("").success).toBe(false);
  });

  test("rejects a string that isn't a 24-char hex value", () => {
    expect(objectIdSchema.safeParse("not-an-object-id").success).toBe(false);
    expect(objectIdSchema.safeParse("507f1f77bcf86cd79943901").success).toBe(false); // 23 chars
  });
});

describe("SignInSchema", () => {
  test("accepts a valid email and password", () => {
    expect(SignInSchema.safeParse({ email: "user@example.com", password: "secret1" }).success).toBe(true);
  });

  test("rejects an invalid email", () => {
    expect(SignInSchema.safeParse({ email: "not-an-email", password: "secret1" }).success).toBe(false);
  });

  test("rejects a password shorter than 6 characters", () => {
    expect(SignInSchema.safeParse({ email: "user@example.com", password: "123" }).success).toBe(false);
  });
});

describe("SignUpSchema", () => {
  const base = {
    username: "valid_user1",
    name: "Valid Name",
    email: "user@example.com",
  };

  test("accepts a password containing upper, lower, digit, and special characters", () => {
    expect(SignUpSchema.safeParse({ ...base, password: "Abcdef1!" }).success).toBe(true);
  });

  test.each([
    ["missing uppercase", "abcdef1!"],
    ["missing lowercase", "ABCDEF1!"],
    ["missing digit", "Abcdefg!"],
    ["missing special character", "Abcdefg1"],
  ])("rejects a password %s", (_label, password) => {
    expect(SignUpSchema.safeParse({ ...base, password }).success).toBe(false);
  });

  test("rejects a username with characters other than letters, numbers, and underscores", () => {
    expect(SignUpSchema.safeParse({ ...base, username: "not valid!", password: "Abcdef1!" }).success).toBe(false);
  });

  test("rejects a name containing digits", () => {
    expect(SignUpSchema.safeParse({ ...base, name: "Name123", password: "Abcdef1!" }).success).toBe(false);
  });
});

describe("AskQuestionSchema", () => {
  const validContent = "a".repeat(100);

  test("accepts a well-formed question", () => {
    const result = AskQuestionSchema.safeParse({
      title: "How do I use Zod?",
      content: validContent,
      tags: ["zod", "typescript"],
    });
    expect(result.success).toBe(true);
  });

  test("rejects a title shorter than 5 characters", () => {
    expect(AskQuestionSchema.safeParse({ title: "Hi", content: validContent, tags: ["zod"] }).success).toBe(false);
  });

  test("rejects content shorter than 100 characters", () => {
    expect(
      AskQuestionSchema.safeParse({ title: "How do I use Zod?", content: "too short", tags: ["zod"] }).success
    ).toBe(false);
  });

  test("rejects zero tags and more than 3 tags", () => {
    expect(AskQuestionSchema.safeParse({ title: "How do I use Zod?", content: validContent, tags: [] }).success).toBe(
      false
    );
    expect(
      AskQuestionSchema.safeParse({
        title: "How do I use Zod?",
        content: validContent,
        tags: ["a", "b", "c", "d"],
      }).success
    ).toBe(false);
  });
});

describe("UserSchema", () => {
  test("accepts a user without optional fields", () => {
    expect(UserSchema.safeParse({ name: "Jane", username: "jane_doe", email: "jane@example.com" }).success).toBe(true);
  });

  test("rejects an invalid image URL when provided", () => {
    expect(
      UserSchema.safeParse({
        name: "Jane",
        username: "jane_doe",
        email: "jane@example.com",
        image: "not-a-url",
      }).success
    ).toBe(false);
  });
});

describe("AccountSchema", () => {
  const base = {
    userId: "507f1f77bcf86cd799439011",
    name: "Jane",
    provider: "github",
    providerAccountId: "12345",
  };

  test("accepts an account with no password (OAuth)", () => {
    expect(AccountSchema.safeParse(base).success).toBe(true);
  });

  test("rejects a weak password when one is provided (credentials)", () => {
    expect(AccountSchema.safeParse({ ...base, password: "weak" }).success).toBe(false);
  });

  test("accepts a strong password when one is provided", () => {
    expect(AccountSchema.safeParse({ ...base, password: "Abcdef1!" }).success).toBe(true);
  });

  test("rejects an invalid userId", () => {
    expect(AccountSchema.safeParse({ ...base, userId: "not-an-object-id" }).success).toBe(false);
  });
});

describe("SignInWithOAuthSchema", () => {
  test("accepts github and google providers", () => {
    const user = { name: "Jane", username: "jane_doe", email: "jane@example.com" };
    expect(SignInWithOAuthSchema.safeParse({ provider: "github", providerAccountId: "1", user }).success).toBe(true);
    expect(SignInWithOAuthSchema.safeParse({ provider: "google", providerAccountId: "1", user }).success).toBe(true);
  });

  test("rejects a provider outside the allowed enum", () => {
    const user = { name: "Jane", username: "jane_doe", email: "jane@example.com" };
    expect(SignInWithOAuthSchema.safeParse({ provider: "facebook", providerAccountId: "1", user }).success).toBe(false);
  });
});

describe("PaginatedSearchParamsSchema", () => {
  test("defaults page to 1 and pageSize to 10 when omitted", () => {
    const result = PaginatedSearchParamsSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  test("rejects a sort value outside the allowed enum", () => {
    expect(PaginatedSearchParamsSchema.safeParse({ sort: "trending" }).success).toBe(false);
  });
});

describe("GetTagQuestionsSchema (extends PaginatedSearchParamsSchema)", () => {
  test("requires tagId in addition to the inherited pagination fields", () => {
    expect(GetTagQuestionsSchema.safeParse({ tagId: "507f1f77bcf86cd799439011" }).success).toBe(true);
    expect(GetTagQuestionsSchema.safeParse({}).success).toBe(false);
  });
});

describe("EditQuestionSchema (extends AskQuestionSchema)", () => {
  test("requires questionId in addition to the inherited question fields", () => {
    const result = EditQuestionSchema.safeParse({
      questionId: "507f1f77bcf86cd799439011",
      title: "How do I use Zod?",
      content: "a".repeat(100),
      tags: ["zod"],
    });
    expect(result.success).toBe(true);
  });

  test("rejects when questionId is missing", () => {
    expect(
      EditQuestionSchema.safeParse({
        title: "How do I use Zod?",
        content: "a".repeat(100),
        tags: ["zod"],
      }).success
    ).toBe(false);
  });
});

describe("CreateVoteSchema / UpdateVoteCountSchema", () => {
  test("accepts valid target/vote type combinations", () => {
    expect(CreateVoteSchema.safeParse({ targetId: "1", targetType: "question", voteType: "upvote" }).success).toBe(
      true
    );
  });

  test("rejects an invalid targetType or voteType", () => {
    expect(CreateVoteSchema.safeParse({ targetId: "1", targetType: "comment", voteType: "upvote" }).success).toBe(
      false
    );
    expect(CreateVoteSchema.safeParse({ targetId: "1", targetType: "question", voteType: "like" }).success).toBe(false);
  });

  test("UpdateVoteCountSchema only accepts -1 or 1 as change", () => {
    const base = { targetId: "1", targetType: "question" as const, voteType: "upvote" as const };
    expect(UpdateVoteCountSchema.safeParse({ ...base, change: 1 }).success).toBe(true);
    expect(UpdateVoteCountSchema.safeParse({ ...base, change: -1 }).success).toBe(true);
    expect(UpdateVoteCountSchema.safeParse({ ...base, change: 2 }).success).toBe(false);
  });
});

describe("CreateInteractionSchema", () => {
  test("accepts every action defined in InteractionActionEnums", () => {
    const result = CreateInteractionSchema.safeParse({
      action: "bookmark",
      actionTarget: "question",
      actionId: "1",
      authorId: "1",
    });
    expect(result.success).toBe(true);
  });

  test("rejects an action outside the enum", () => {
    expect(
      CreateInteractionSchema.safeParse({
        action: "not-a-real-action",
        actionTarget: "question",
        actionId: "1",
        authorId: "1",
      }).success
    ).toBe(false);
  });
});

describe("UpdateUserSchema", () => {
  test("accepts a fully-formed profile update", () => {
    const result = UpdateUserSchema.safeParse({
      name: "Jane Doe",
      username: "jane_doe",
      portfolio: "https://example.com",
      location: "Remote",
      bio: "Building things.",
    });
    expect(result.success).toBe(true);
  });

  test("rejects an invalid portfolio URL", () => {
    expect(
      UpdateUserSchema.safeParse({
        name: "Jane Doe",
        username: "jane_doe",
        portfolio: "not-a-url",
        location: "Remote",
        bio: "Building things.",
      }).success
    ).toBe(false);
  });
});

describe("GlobalSearchSchema", () => {
  test("accepts a query with a null or omitted type", () => {
    expect(GlobalSearchSchema.safeParse({ query: "react" }).success).toBe(true);
    expect(GlobalSearchSchema.safeParse({ query: "react", type: null }).success).toBe(true);
  });
});
