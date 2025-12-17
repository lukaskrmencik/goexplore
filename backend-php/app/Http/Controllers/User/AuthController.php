<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use App\Models\User\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Illuminate\Validation\Rules\Password;
use App\Http\Controllers\Controller;

class AuthController extends Controller
{
    //signup
    public function signup(Request $request)
    {
        //validation
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)->mixedCase()->numbers(),
            ],
        ]);

        //creating user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        //generating token
        $token = JWTAuth::fromUser($user);

        //response
        return response()->success([
            'token' => $token,
            'user' => $user,
        ],201);
    }

    //login
    public function login(Request $request)
    {
        //pick credentials from request
        $credentials = $request->only('email', 'password');

        //check token
        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->error('Invalid credentials', 401);
        }

        //if correct response
        return response()->success([
            'token' => $token,
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ],200);
    }

    //logout
    public function logout()
    {
        //invalidate token
        JWTAuth::invalidate(JWTAuth::getToken());

        //response
        return response()->success([], 200);
    }
}
