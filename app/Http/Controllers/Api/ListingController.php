<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreListingRequest;
use App\Http\Requests\UpdateListingRequest;
use App\Models\Listing;
use App\Http\Controllers\Api\category;


class ListingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Listing::with(['user', 'category']);

        if ($request->filled('search')){
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category')){
            $query->where('category_id', $request->category);
        }

        if ($request->filled('status')){
            $query->where('status', $request->status);
        }

        $listings = $query
            ->latest()
            ->paginate(10);
        return response()->json($listings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreListingRequest $request)
    {
        $listing = Listing::create([
            'user_id' => $request->user()->id,
            'category_id' => $request->category_id,
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'transaction_type' => $request->transaction_type,
            'status' => 'available'
        ]);

        return response()->json([
            'message' => 'Listing created successfully.',
            'listing' => $listing
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Listing $listing)
    {
        $listing->load(['user', 'category']);
        return response()->json($listing);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateListingRequest $request, Listing $listing)
    {
        if ($request->user()->id !== $listing->user_id){
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $listing->update($request->validated());

        return response()->json([
            'message' => 'Listing updated successfully.',
            'listing' => $listing
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Listing $listing)
    {
        if ($request->user()->id !== $listing->user_id){
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $listing->delete();

        return response()->json([
            'message' => 'Listing deleted successfully.'
        ]);
    }
}
