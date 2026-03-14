<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|string|in:user,restaurateur',
        ]);

        $verificationCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user = User::create([
            'name' => $request->name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'user',
            'verification_code' => $verificationCode,
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\VerificationMail($verificationCode));
        } catch (\Exception $e) {
            // Log the error or handle it (in a real app, you might want to retry or notify)
            \Illuminate\Support\Facades\Log::error("Failed to send verification email to {$user->email}: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Inscription réussie. Veuillez vérifier votre email pour le code de validation.',
            'user_id' => $user->id
        ], 201);
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $isDev = config('app.env') === 'local' || config('app.env') === 'testing';

        $userQuery = User::where('email', $request->email);

        if ($isDev && $request->code === '000000') {
            $user = $userQuery->first();
        } else {
            $user = $userQuery->where('verification_code', $request->code)->first();
        }

        if (!$user) {
            return response()->json(['message' => 'Code de vérification invalide.'], 422);
        }

        $user->email_verified_at = now();
        $user->verification_code = null;
        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
            'message' => 'Email vérifié avec succès.'
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Veuillez vérifier votre email avant de vous connecter.',
                'needs_verification' => true,
                'email' => $user->email
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }
}
