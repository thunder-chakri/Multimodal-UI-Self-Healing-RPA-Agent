export interface Review {
  id: string;
  user_id: string;
  author_name: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateReviewInput {
  rating: number;
  comment: string;
  author_name?: string;
}

export interface ReviewApiResponse {
  success: boolean;
  data?: Review[];
  error?: string;
}
