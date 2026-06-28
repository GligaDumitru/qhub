type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse = ActionResponse<undefined> & { success: false };

type APIErrorResponse = NextResponse<ErrorResponse>;
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

type PaginatedResponse<T = null> = ActionResponse<{
  data?: T;
  isNext: boolean;
}>;

interface UrlQueryParams {
  params: string;
  key: string;
  value: string | null;
}

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

interface Tag {
  _id: string;
  name: string;
  questions?: number;
}

interface Author {
  _id: string;
  name: string;
  image: string;
}

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: Tag[];
  author: Author;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  answers: number;
  views: number;
}

interface Answer {
  _id: string;
  author: Author;
  content: string;
  upvotes: number;
  question: string;
  downvotes: number;
  createdAt: string;
  question: string;
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface PaginatedSearchParams {
  page?: number;
  pageSize?: number;
  query?: string;
  filter?: string;
  sort?: string;
}

interface Collection {
  _id: string;
  author: string | Author;
  question: Question;
}

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  location?: string;
  portfolio?: string;
  reputation?: number;
  createdAt: Date;
}

interface Badges {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
}

interface Job {
  job_id?: string;
  employer_name?: string;
  employer_logo?: string;
  employer_website?: string;
  job_employment_type?: string;
  job_employment_types?: string[];
  job_title?: string;
  job_description?: string;
  job_apply_link?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_location?: string;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary?: number | null;
  job_salary_period?: string | null;
  industry?: string;
  job_function?: string;
}

interface Country {
  names: {
    common: string;
  };
  cca2: string;
}

interface CountryFilter {
  name: string;
  value: string;
}

interface GlobalSearchedItem {
  id: string;
  type: "question" | "answer" | "user" | "tag";
  title: string;
}

interface Badges {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
}
