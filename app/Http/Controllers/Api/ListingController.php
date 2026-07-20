<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreListingRequest;
use App\Http\Requests\UpdateListingRequest;
use App\Http\Resources\ListingResource;
use App\Models\Listing;

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

        if ($request->filled('transaction_type')) {
            $query->where('transaction_type', $request->transaction_type);
        }

        if ($request->filled('status')){
            $query->where('status', $request->status);
        }

        $listings = $query
            ->latest()
            ->paginate(10);
        return ListingResource::collection($listings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreListingRequest $request): JsonResponse {
        $validated = $request->validated();

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request
                ->file('image')
                ->store('listings', 'public');
        }

        $listing = Listing::create([
            'user_id' => $request->user()->id,
            'category_id' => $validated['category_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'image' => $imagePath,
            'price' => $validated['transaction_type'] === 'sale'
                ? $validated['price']
                : null,
            'transaction_type' => $validated['transaction_type'],
            'status' => 'available',
        ]);

        $listing->load([
            'user',
            'category',
        ]);

        return response()->json([
            'message' => 'Anúncio criado com sucesso.',
            'listing' => new ListingResource($listing),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Listing $listing)
    {
        $listing->load(['user', 'category']);
        return new ListingResource($listing);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateListingRequest $request, Listing $listing)
    {
        if ($request->user()->id !== $listing->user_id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validated();

        if ($request->hasFile('image')) {
            if (
                $listing->image &&
                Storage::disk('public')->exists($listing->image)
            ) {
                Storage::disk('public')->delete($listing->image);
            }

            $validated['image'] = $request
                ->file('image')
                ->store('listings', 'public');
        } elseif ($request->boolean('remove_image')) {
            if (
                $listing->image &&
                Storage::disk('public')->exists($listing->image)
            ) {
                Storage::disk('public')->delete($listing->image);
            }

            $validated['image'] = null;
        }

        $listing->update($validated);

        $listing->load(['user', 'category']);

        return response()->json([
            'message' => 'Listing updated successfully.',
            'listing' => new ListingResource($listing),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(
        Request $request,
        Listing $listing
    ): JsonResponse {
        if (
            (int) $request->user()->id !==
            (int) $listing->user_id
        ) {
            return response()->json([
                'message' => 'Não autorizado.',
            ], 403);
        }

        if (
            $listing->image &&
            Storage::disk('public')->exists($listing->image)
        ) {
            Storage::disk('public')->delete($listing->image);
        }

        $listing->delete();

        return response()->json([
            'message' => 'Anúncio eliminado com sucesso.',
        ]);
    }

    public function myListings(Request $request)
    {
        $listings = Listing::with(['user', 'category'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return ListingResource::collection($listings);
    }
}
