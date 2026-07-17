<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Services\UserNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Lista as avaliações relacionadas com o utilizador autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = (int) $request->user()->id;
        $type = $request->query('type');

        $reviews = Review::with([
                'reviewer:id,name',
                'reviewedUser:id,name',
            ])
            ->when(
                $type === 'received',
                fn ($query) => $query->where(
                    'reviewed_user_id',
                    $userId
                )
            )
            ->when(
                $type === 'given',
                fn ($query) => $query->where(
                    'reviewer_id',
                    $userId
                )
            )
            ->when(
                ! in_array($type, ['received', 'given'], true),
                function ($query) use ($userId) {
                    $query->where(function ($subQuery) use ($userId) {
                        $subQuery
                            ->where('reviewer_id', $userId)
                            ->orWhere('reviewed_user_id', $userId);
                    });
                }
            )
            ->latest()
            ->get();

        return response()->json([
            'data' => ReviewResource::collection($reviews)
                ->resolve($request),
        ]);
    }

    /**
     * Cria uma avaliação.
     */
    public function store(
        StoreReviewRequest $request,
        UserNotificationService $notificationService
    ): JsonResponse {
        $reviewer = $request->user();
        $reviewerId = (int) $reviewer->id;
        $reviewedUserId = (int) $request->validated(
            'reviewed_user_id'
        );

        if ($reviewedUserId === $reviewerId) {
            return response()->json([
                'message' => 'Não pode avaliar a sua própria conta.',
            ], 422);
        }

        $existingReview = Review::where(
                'reviewer_id',
                $reviewerId
            )
            ->where(
                'reviewed_user_id',
                $reviewedUserId
            )
            ->exists();

        if ($existingReview) {
            return response()->json([
                'message' => 'Já avaliou este utilizador.',
            ], 422);
        }

        $review = DB::transaction(function () use (
            $request,
            $reviewer,
            $reviewerId,
            $reviewedUserId,
            $notificationService
        ) {
            $review = Review::create([
                'reviewer_id' => $reviewerId,
                'reviewed_user_id' => $reviewedUserId,
                'rating' => $request->validated('rating'),
                'comment' => $request->validated('comment'),
            ]);

            $notificationService->create(
                userId: $reviewedUserId,
                title: 'Nova avaliação',
                message: $reviewer->name
                    . ' avaliou o seu perfil com '
                    . $review->rating
                    . ' estrela(s).'
            );

            return $review;
        });

        $review->load([
            'reviewer:id,name',
            'reviewedUser:id,name',
        ]);

        return response()->json([
            'message' => 'Avaliação criada com sucesso.',
            'data' => (new ReviewResource($review))
                ->resolve($request),
        ], 201);
    }

    /**
     * Mostra uma avaliação.
     */
    public function show(
        Request $request,
        Review $review
    ): JsonResponse {
        $this->authorizeAccess($request, $review);

        $review->load([
            'reviewer:id,name',
            'reviewedUser:id,name',
        ]);

        return response()->json([
            'data' => (new ReviewResource($review))
                ->resolve($request),
        ]);
    }

    /**
     * Actualiza uma avaliação feita pelo utilizador.
     */
    public function update(
        UpdateReviewRequest $request,
        Review $review
    ): JsonResponse {
        $this->authorizeOwner($request, $review);

        $review->update($request->validated());

        $review->load([
            'reviewer:id,name',
            'reviewedUser:id,name',
        ]);

        return response()->json([
            'message' => 'Avaliação actualizada com sucesso.',
            'data' => (new ReviewResource($review->fresh()))
                ->resolve($request),
        ]);
    }

    /**
     * Elimina uma avaliação feita pelo utilizador.
     */
    public function destroy(
        Request $request,
        Review $review
    ): JsonResponse {
        $this->authorizeOwner($request, $review);

        $review->delete();

        return response()->json([
            'message' => 'Avaliação eliminada com sucesso.',
        ]);
    }

    /**
     * Confirma que o utilizador participa na avaliação.
     */
    private function authorizeAccess(
        Request $request,
        Review $review
    ): void {
        $userId = (int) $request->user()->id;

        abort_unless(
            (int) $review->reviewer_id === $userId ||
            (int) $review->reviewed_user_id === $userId,
            403,
            'Não possui autorização para consultar esta avaliação.'
        );
    }

    /**
     * Confirma que a avaliação pertence ao utilizador.
     */
    private function authorizeOwner(
        Request $request,
        Review $review
    ): void {
        abort_unless(
            (int) $review->reviewer_id ===
                (int) $request->user()->id,
            403,
            'Não possui autorização para alterar esta avaliação.'
        );
    }
}