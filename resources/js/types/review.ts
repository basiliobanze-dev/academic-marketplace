export interface ReviewUser {
    id: number;
    name: string;
}

export interface Review {
    id: number;
    rating: number;
    comment: string | null;
    is_mine: boolean;
    reviewer: ReviewUser;
    reviewed_user: ReviewUser;
    created_at: string;
    updated_at: string;
}