const ROUTES = {
  HOME: "/",
  COLLECTIONS: "/collections",
  JOBS: "/jobs",
  TAGS: "/tags",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ASK_QUESTION: "/ask-question",
  QUESTION: (id: string) => `/questions/${id}`,
  PROFILE: (id: string) => `/profile/${id}`,
  TAG: (id: string) => `/tags/${id}`,
};

export default ROUTES;
