<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $reviews = Review::with([
            'reviewer',
            'reviewedUser'
        ])->latest()->get();

        return response()->json(
            ReviewResource::collection($reviews)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $review = Review::create([
            'reviewer_id' => $request->user()->id,
            'reviewed_user_id' => $request->reviewed_user_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'message' => 'Review created successfully.',
            'review' => new ReviewResource($review)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Review $review): JsonResponse
    {
        $review->load([
            'reviewer',
            'reviewedUser'
        ]);

        return response()->json(
            new ReviewResource($review)
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReviewRequest $request, Review $review): JsonResponse
    {
        if ($review->reviewer_id != $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $review->update($request->validated());

        return response()->json([
            'message' => 'Review updated successfully.',
            'review' => new ReviewResource($review),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Review $review): JsonResponse
    {
        if ($review->reviewer_id != $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully.'
        ]);
    }
}
