<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReportRequest;
use App\Http\Requests\UpdateReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $reports = Report::with([
            'reporter',
            'listing',
            'reportedUser'
        ])->latest()->get();

        return response()->json(
            ReportResource::collection($reports)
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReportRequest $request): JsonResponse
    {
        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'listing_id' => $request->listing_id,
            'reported_user_id' => $request->reported_user_id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        $report->load([
            'reporter',
            'listing.user',
            'listing.category',
            'reportedUser'
        ]);

        return response()->json([
            'message' => 'Report submitted successfully.',
            'report' => new ReportResource($report),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Report $report): JsonResponse
    {
        $report->load([
            'reporter',
            'listing.user',
            'listing.category',
            'reportedUser'
        ]);

        return response()->json(
            new ReportResource($report)
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReportRequest $request, Report $report): JsonResponse
    {
        if ($request->user()->role !== 'admin') {

            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);

        }

        $report->update($request->validated());

        $report->load([
            'reporter',
            'listing.user',
            'listing.category',
            'reportedUser'
        ]);

        return response()->json([
            'message' => 'Report updated successfully.',
            'report' => new ReportResource($report),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Report $report): JsonResponse
    {
        if ($request->user()->role !== 'admin') {

            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);

        }

        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully.'
        ]);
    }
}
