<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Http\Resources\ReportResource;
use App\Http\Resources\UserResource;
use App\Models\Listing;
use App\Models\Report;
use App\Models\User;
use App\Services\UserNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Dados gerais do painel administrativo.
     */
    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'users' => User::count(),
                'students' => User::where(
                    'role',
                    'student'
                )->count(),
                'admins' => User::where(
                    'role',
                    'admin'
                )->count(),
                'listings' => Listing::count(),
                'reports' => Report::count(),
                'pending_reports' => Report::where(
                    'status',
                    'pending'
                )->count(),
                'resolved_reports' => Report::where(
                    'status',
                    'resolved'
                )->count(),
            ],
        ]);
    }

    /**
     * Lista utilizadores com paginação.
     */
    public function users(Request $request): JsonResponse
    {
        $users = User::latest()->paginate(10);

        return response()->json([
            'data' => UserResource::collection(
                $users->items()
            )->resolve($request),

            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Remove um utilizador.
     */
    public function destroyUser(
        Request $request,
        User $user
    ): JsonResponse {
        if ((int) $user->id === (int) $request->user()->id) {
            return response()->json([
                'message' =>
                    'Não pode eliminar a sua própria conta administrativa.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilizador eliminado com sucesso.',
        ]);
    }

    /**
     * Lista anúncios com paginação.
     */
    public function listings(Request $request): JsonResponse
    {
        $listings = Listing::with([
                'user',
                'category',
            ])
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => ListingResource::collection(
                $listings->items()
            )->resolve($request),

            'meta' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
            ],
        ]);
    }

    /**
     * Remove um anúncio.
     */
    public function destroyListing(
        Request $request,
        Listing $listing,
        UserNotificationService $notificationService
    ): JsonResponse {
        DB::transaction(function () use (
            $listing,
            $notificationService
        ) {
            $ownerId = (int) $listing->user_id;
            $listingTitle = $listing->title;

            $listing->delete();

            $notificationService->create(
                userId: $ownerId,
                title: 'Anúncio removido',
                message: 'O seu anúncio "'
                    . $listingTitle
                    . '" foi removido pelo administrador.'
            );
        });

        return response()->json([
            'message' => 'Anúncio eliminado com sucesso.',
        ]);
    }

    /**
     * Lista denúncias com paginação.
     */
    public function reports(Request $request): JsonResponse
    {
        $reports = Report::with([
                'reporter',
                'listing.user',
                'listing.category',
                'reportedUser',
            ])
            ->latest()
            ->paginate(10);

        return response()->json([
            'data' => ReportResource::collection(
                $reports->items()
            )->resolve($request),

            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    /**
     * Resolve uma denúncia.
     */
    public function resolveReport(
        Request $request,
        Report $report,
        UserNotificationService $notificationService
    ): JsonResponse {
        if ($report->status === 'resolved') {
            return response()->json([
                'message' => 'Esta denúncia já foi resolvida.',
            ], 422);
        }

        DB::transaction(function () use (
            $report,
            $notificationService
        ) {
            $report->update([
                'status' => 'resolved',
            ]);

            $notificationService->create(
                userId: (int) $report->reporter_id,
                title: 'Denúncia analisada',
                message: 'A sua denúncia foi analisada e marcada '
                    . 'como resolvida pelo administrador.'
            );
        });

        $report->load([
            'reporter',
            'listing.user',
            'listing.category',
            'reportedUser',
        ]);

        return response()->json([
            'message' => 'Denúncia resolvida com sucesso.',
            'data' => (new ReportResource($report->fresh()))
                ->resolve($request),
        ]);
    }
}