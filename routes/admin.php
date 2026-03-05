<?php

use App\Http\Controllers\Admin\AdminUserLogController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin'])->group(function () {
    // Dashboard
    // Route::get('/dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');

    // Analytics & Visitor Tracking
    Route::prefix('admin/analytics')->name('analytics.')->group(function () {
        Route::get('/', [AnalyticsController::class, 'index'])
            ->name('index');
        Route::get('/summary', [AnalyticsController::class, 'summary'])
            ->name('summary');
        Route::get('/chart-data', [AnalyticsController::class, 'chartData'])
            ->name('chart-data');
        Route::get('/top-routes', [AnalyticsController::class, 'topRoutes'])
            ->name('top-routes');
        Route::get('/top-referrers', [AnalyticsController::class, 'topReferrers'])
            ->name('top-referrers');
    });

    // Users additional routes (must be before resource routes)
    Route::get('users/trashed', [UserController::class, 'trashed'])
        ->name('users.trashed');
    Route::post('users/{id}/restore', [UserController::class, 'restore'])
        ->name('users.restore');
    Route::delete('users/{id}/force-delete', [UserController::class, 'forceDelete'])
        ->name('users.force-delete');
    Route::post('users/{id}/toggle-status', [UserController::class, 'toggleStatus'])
        ->name('users.toggle-status');
    Route::patch('users/{id}/avatar', [UserController::class, 'updateAvatar'])
        ->name('users.update-avatar');
    Route::delete('users/{id}/avatar', [UserController::class, 'deleteAvatar'])
        ->name('users.delete-avatar');
    Route::get('activity-logs/users', [AdminUserLogController::class, 'users'])
        ->name('activity-logs.users');
    Route::get('activity-logs', [AdminUserLogController::class, 'index'])
        ->name('activity-logs.index');
    Route::get('users/{user}/activity-logs', [AdminUserLogController::class, 'user'])
        ->name('activity-logs.user');

    // Users CRUD
    Route::resource('users', UserController::class)->names('users');
});
