<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AuthController;

// ✅ Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ✅ Protected routes (requires Sanctum token)
Route::middleware('auth:sanctum')->group(function () {
    // Assignments
    Route::get('/assignments', [AssignmentController::class, 'index']);
    Route::post('/assignments', [AssignmentController::class, 'store']);
    Route::put('/assignments/{id}', [AssignmentController::class, 'update']);
    Route::delete('/assignments/{id}', [AssignmentController::class, 'destroy']);

    // Authenticated user info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ✅ Logout should be inside sanctum middleware
    Route::post('/logout', [AuthController::class, 'logout']);
});
