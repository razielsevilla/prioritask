<?php

use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\UserController;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('assignments', AssignmentController::class);
    Route::post('assignments/prioritize', [AssignmentController::class, 'prioritize']);
    Route::get('user/preferences', [UserController::class, 'preferences']);
    Route::post('user/preferences', [UserController::class, 'savePreferences']);
});

