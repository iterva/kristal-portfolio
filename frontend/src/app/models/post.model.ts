export interface PostImage {
  id: number;
  image_url: string;
  order: number;
}

export interface PostFileItem {
  id: number;
  file_url: string;
  file_name: string;
  order: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  file_url: string | null;
  file_name: string;
  tags_list: string[];
  author_name?: string;
  author?: Author;
  published: boolean;
  created_at: string;
  updated_at: string;
  images: PostImage[];
  all_files: PostFileItem[];
  files_count?: number;
}

export interface Author {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile: Profile;
}

export interface Profile {
  bio: string;
  avatar: string | null;
  github_url: string;
  linkedin_url: string;
  website_url: string;
  location: string;
  title: string;
  headline: string;
  photos: ProfilePhoto[];
  logo_url: string | null;
}

export interface ProfilePhoto {
  id: number;
  image_url: string;
  order: number;
}

export interface ProfileResponse {
  name: string;
  email: string;
  profile: Profile;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}
