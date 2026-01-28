const ROUTES = {
  HOME: "/",
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ASK_QUESTION: "/ask-question",
  QUESTION: (id: string) => `/questions/${id}`,
  PROFILE: (id: string) => `/profile/${id}`,
  TAGS: (id: string) => `/tags/${id}`,
  TAG: (id: string) => `/tags/${id}`,
};

export default ROUTES;
