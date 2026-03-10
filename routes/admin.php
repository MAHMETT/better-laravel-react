<?php

use App\Http\Controllers\Admin\AdminUserLogController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VisitorAnalyticsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin'])->group(function () {
    // Dashboard
    // Route::get('/dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');

    // Visitor Management Dashboard
    Route::prefix('admin/visitor-analytics')->name('visitor-analytics.')->group(function () {
        Route::get('/', [VisitorAnalyticsController::class, 'index'])
            ->name('index');
        Route::get('/kpi-stats', [VisitorAnalyticsController::class, 'kpiStats'])
            ->name('kpi-stats');
        Route::get('/daily-visits', [VisitorAnalyticsController::class, 'dailyVisits'])
            ->name('daily-visits');
        Route::get('/peak-hour', [VisitorAnalyticsController::class, 'peakHour'])
            ->name('peak-hour');
        Route::get('/returning-visitors', [VisitorAnalyticsController::class, 'returningVisitors'])
            ->name('returning-visitors');
        Route::get('/purpose-of-visit', [VisitorAnalyticsController::class, 'purposeOfVisit'])
            ->name('purpose-of-visit');
        Route::get('/region-distribution', [VisitorAnalyticsController::class, 'regionDistribution'])
            ->name('region-distribution');
        Route::get('/live-feed', [VisitorAnalyticsController::class, 'liveFeed'])
            ->name('live-feed');
        Route::post('/export', [VisitorAnalyticsController::class, 'export'])
            ->name('export');
    });

    // Analytics & Visitor Tracking (existing)
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
    Route::post('users/{user}/restore', [UserController::class, 'restore'])
        ->name('users.restore')
        ->can('restore', 'user');
    Route::delete('users/{user}/force-delete', [UserController::class, 'forceDelete'])
        ->name('users.force-delete')
        ->can('forceDelete', 'user');
    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])
        ->name('users.toggle-status')
        ->can('toggleStatus', 'user');
    Route::patch('users/{user}/avatar', [UserController::class, 'updateAvatar'])
        ->name('users.update-avatar')
        ->can('updateAvatar', 'user');
    Route::delete('users/{user}/avatar', [UserController::class, 'deleteAvatar'])
        ->name('users.delete-avatar')
        ->can('deleteAvatar', 'user');
    Route::get('activity-logs/users', [AdminUserLogController::class, 'users'])
        ->name('activity-logs.users');
    Route::get('activity-logs', [AdminUserLogController::class, 'index'])
        ->name('activity-logs.index');
    Route::get('users/{user}/activity-logs', [AdminUserLogController::class, 'user'])
        ->name('activity-logs.user');

    // Users CRUD
    Route::resource('users', UserController::class)->names('users');
});
