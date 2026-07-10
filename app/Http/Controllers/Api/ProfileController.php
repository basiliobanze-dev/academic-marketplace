<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request){
         return new UserResource($request->user());
    }

    public function update(UpdateProfileRequest $request){
        $user = $request->user();
        $user->update([
            'name' => $request->name,
            'email' => $request->email
        ]);

        return response()->json([
            'message' => 'Profile updated successfuly.',
            'user' => new UserResource($user),
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request){
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)){
            return response()->json([
                'message' => 'Current password is incorrect.'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Password updated successfully.'
        ]);
    }
}
