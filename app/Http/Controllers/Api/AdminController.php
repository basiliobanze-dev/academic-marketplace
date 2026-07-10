<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Listing;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Dashboard.
     */
    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'listings' => Listing::count(),
            'reports' => Report::count(),
            'pending_reports' => Report::where('status', 'pending')->count(),
            'resolved_reports' => Report::where('status', 'resolved')->count(),
        ]);
    }

    /**
     * Listar utilizadores.
     */
    public function users(Request $request): JsonResponse
    {
        return response()->json(
            User::latest()->get()
        );
    }

    /**
     * Remover utilizador.
     */
    public function destroyUser(Request $request, User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.'
        ]);
    }

    /**
     * Listar anúncios.
     */
    public function listings(Request $request): JsonResponse
    {
        return response()->json(
            Listing::with('user', 'category')
                ->latest()
                ->get()
        );
    }

    /**
     * Remover anúncio.
     */
    public function destroyListing(Request $request, Listing $listing): JsonResponse
    {
        $listing->delete();

        return response()->json([
            'message' => 'Listing deleted successfully.'
        ]);
    }

    /**
     * Listar denúncias.
     */
    public function reports(Request $request): JsonResponse
    {
        return response()->json(
            Report::with([
                'reporter',
                'listing',
                'reportedUser'
            ])->latest()->get()
        );
    }

    /**
     * Resolver denúncia.
     */
    public function resolveReport(Request $request, Report $report): JsonResponse
    {
        $report->update([
            'status' => 'resolved'
        ]);

        return response()->json([
            'message' => 'Report resolved successfully.',
            'report' => $report
        ]);
    }
}
