<?php

use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:admin'])->group(function () {
    // Dashboard
    // Route::get('/dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');

    // Users additional routes (must be before resource routes)
    Route::get('users/trashed', [UserController::class, 'trashed'])
        ->name('users.trashed');
    Route::post('users/{id}/restore', [UserController::class, 'restore'])
        ->name('users.restore');
    Route::delete('users/{id}/force-delete', [UserController::class, 'forceDelete'])
        ->name('users.force-delete');
    Route::post('users/{id}/toggle-status', [UserController::class, 'toggleStatus'])
        ->name('users.toggle-status');

    // Users CRUD
    Route::resource('users', UserController::class)->names('users');
});
